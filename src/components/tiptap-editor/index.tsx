import type {
  Extensions,
  JSONContent,
  Editor as TiptapEditor,
} from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { normalizeLinkHref } from "@/lib/links/normalize-link-href";
import { cn } from "@/lib/utils";
import type { FormulaModalPayload } from "./formula-modal-store";
import {
  addFormulaModalOpener,
  removeFormulaModalOpener,
  setActiveFormulaModalOpenerKey,
} from "./formula-modal-store";
import EditorToolbar from "./ui/editor-toolbar";
import type { FormulaMode } from "./ui/formula-modal";
import { FormulaModal } from "./ui/formula-modal";
import type { CardVideoModalType } from "./ui/insert-card-video-modal";
import { InsertCardVideoModal } from "./ui/insert-card-video-modal";
import type { ModalType } from "./ui/insert-modal";
import InsertModal from "./ui/insert-modal";
import { TableBubbleMenu } from "./ui/table-bubble-menu";

interface EditorProps {
  content?: JSONContent | string;
  onChange?: (json: JSONContent) => void;
  onCreated?: (editor: TiptapEditor) => void;
  extensions: Extensions;
  editable?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Editor = memo(function Editor({
  content,
  onChange,
  onCreated,
  extensions,
  editable = true,
  className,
  contentClassName,
}: EditorProps) {
  const formulaOpenerKeyRef = useRef(Symbol("formula-modal-opener"));
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [modalInitialUrl, setModalInitialUrl] = useState("");
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [cardVideoModal, setCardVideoModal] =
    useState<CardVideoModalType>(null);
  const [formulaPayload, setFormulaPayload] = useState<{
    mode: FormulaMode;
    initialLatex: string;
    editContext: { pos: number; type: FormulaMode } | null;
  }>({ mode: "inline", initialLatex: "", editContext: null });

  const editor = useEditor({
    extensions,
    content,
    editable,
    onCreate: ({ editor: currentEditor }) => {
      onCreated?.(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getJSON());
    },
    editorProps: {
      attributes: {
        // `xh-prose` puts the editable body on the SAME stylesheet the public
        // post page uses (see features/theme/themes/xinghui/styles/markdown.css),
        // so what the author types is rendered with the surface's own font,
        // sizes and block rhythm. Without it the admin fell back to Tailwind's
        // preflight reset — every heading at body size, lists without markers,
        // quotes and tables unstyled — which is what made the editor and the
        // published page look like two different sites.
        //
        // Deliberately no `text-*` / `leading-*` utility here: `.xh-prose`
        // sets the body font-size and line-height, and a utility on this same
        // element would outrank the stylesheet's own `p` rules. The
        // admin-only minimum height is kept, and `admin.css` owns the empty
        // paragraph + placeholder styling.
        class: cn(
          "xh-prose max-w-none focus:outline-none min-h-[500px]",
          !editable && "min-h-0",
          contentClassName,
        ),
      },
    },
    immediatelyRender: false,
  });

  const openLinkModal = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    setModalInitialUrl(previousUrl || "");
    setModalOpen("LINK");
  }, [editor]);

  const openImageModal = useCallback(() => {
    setModalInitialUrl("");
    setModalOpen("IMAGE");
  }, []);

  const openFormulaModal = useCallback((mode: FormulaMode) => {
    setFormulaPayload({
      mode,
      initialLatex: mode === "inline" ? "x^2+y^2=z^2" : "E = mc^2",
      editContext: null,
    });
    setFormulaModalOpen(true);
  }, []);

  useEffect(() => {
    if (!editable) return;

    const opener = (payload: FormulaModalPayload) => {
      setFormulaPayload({
        mode: payload.type,
        initialLatex: payload.latex,
        editContext: { pos: payload.pos, type: payload.type },
      });
      setFormulaModalOpen(true);
    };
    addFormulaModalOpener(formulaOpenerKeyRef.current, opener);
    return () => removeFormulaModalOpener(formulaOpenerKeyRef.current);
  }, [editable]);

  const markActiveFormulaOpener = useCallback(() => {
    if (!editable) return;
    setActiveFormulaModalOpenerKey(formulaOpenerKeyRef.current);
  }, [editable]);

  const handleFormulaApply = useCallback(
    (
      latex: string,
      mode: FormulaMode,
      editContext: { pos: number; type: FormulaMode } | null,
    ) => {
      if (!editor) return;
      if (editContext && editContext.type !== mode) {
        const chain = editor
          .chain()
          .setNodeSelection(editContext.pos)
          .deleteSelection();
        if (mode === "inline") {
          chain.insertInlineMath({ latex }).focus().run();
        } else {
          chain.insertBlockMath({ latex }).focus().run();
        }
      } else if (editContext) {
        if (editContext.type === "inline") {
          editor
            .chain()
            .setNodeSelection(editContext.pos)
            .updateInlineMath({ latex })
            .focus()
            .run();
        } else {
          editor
            .chain()
            .setNodeSelection(editContext.pos)
            .updateBlockMath({ latex })
            .focus()
            .run();
        }
      } else {
        if (mode === "inline") {
          editor.chain().focus().insertInlineMath({ latex }).run();
        } else {
          editor.chain().focus().insertBlockMath({ latex }).run();
        }
      }
      setFormulaModalOpen(false);
    },
    [editor],
  );

  // `cursor-pointer` must NOT sit on this editable root: `.xh-prose a` already
  // declares `cursor: pointer`, so a utility that is also a `(0,1,0)` selector on
  // an ancestor would win the link cursor while losing the link COLOR to the
  // same rule (`.xh-prose a` is `(0,1,1)`), splitting one property set across two
  // sources. `admin.css` sets the pointer for links inside the editable body.
  const handleModalSubmit = (
    url: string,
    attrs?: { width?: number; height?: number },
  ) => {
    if (modalOpen === "LINK") {
      if (url === "") {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      } else {
        const href = normalizeLinkHref(url);
        editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
      }
    } else if (modalOpen === "IMAGE") {
      if (url) {
        editor
          ?.chain()
          .focus()
          .setImage({ src: url, ...attrs })
          .run();
      }
    }

    setModalOpen(null);
  };

  return (
    <div className={cn("relative flex flex-col group", className)}>
      {editable && (
        <EditorToolbar
          editor={editor}
          onLinkClick={openLinkModal}
          onImageClick={openImageModal}
          onFormulaInlineClick={() => openFormulaModal("inline")}
          onFormulaBlockClick={() => openFormulaModal("block")}
          onCardClick={() => setCardVideoModal("CARD")}
          onVideoClick={() => setCardVideoModal("VIDEO")}
        />
      )}

      {editable && <TableBubbleMenu editor={editor} />}

      <div
        className="relative min-h-125"
        onMouseDownCapture={markActiveFormulaOpener}
        onFocusCapture={markActiveFormulaOpener}
      >
        <EditorContent editor={editor} />
      </div>

      {editable && (
        <InsertModal
          type={modalOpen}
          initialUrl={modalInitialUrl}
          onClose={() => setModalOpen(null)}
          onSubmit={handleModalSubmit}
        />
      )}

      {editable && (
        <InsertCardVideoModal
          type={cardVideoModal}
          onClose={() => setCardVideoModal(null)}
          onCardSubmit={(attrs) => {
            editor?.chain().focus().insertLinkCard(attrs).run();
          }}
          onVideoSubmit={(src, title) =>
            // 解析失败返回 false，弹窗据此显示错误且不插入。
            editor?.chain().focus().insertVideoEmbed({ src, title }).run() ??
            false
          }
        />
      )}

      {editable && (
        <FormulaModal
          isOpen={formulaModalOpen}
          mode={formulaPayload.mode}
          initialLatex={formulaPayload.initialLatex}
          editContext={formulaPayload.editContext}
          onClose={() => setFormulaModalOpen(false)}
          onApply={handleFormulaApply}
        />
      )}
    </div>
  );
});
