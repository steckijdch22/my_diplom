import React, { useEffect, useRef } from "react";
import Quill from "quill";
import * as Y from "yjs";
import "quill/dist/quill.snow.css";
import { socket } from "../api/socket";
import { QuillBinding } from "y-quill";

const CURSOR_COLORS = [
  "#f56565",
  "#ed8936",
  "#ecc94b",
  "#48bb78",
  "#38b2ac",
  "#4299e1",
  "#667eea",
  "#9f7aea",
  "#ed64a6",
];
const getRandomColor = () =>
  CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];

export const TextEditor: React.FC<{ documentId: string }> = ({
  documentId,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current || !toolbarRef.current) return;

    editorRef.current.innerHTML = "";
    toolbarRef.current.innerHTML = "";

    const editorContainer = document.createElement("div");
    editorRef.current.appendChild(editorContainer);

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("quill");

    socket.connect();
    socket.emit("join-document", documentId);

    ydoc.on("update", (update, origin) => {
      if (origin === socket) {
        return;
      }

      socket.emit("sync-update", {
        roomId: documentId,
        update: update,
      });
    });

    const handleReceiveUpdate = (update: ArrayBuffer) => {
      Y.applyUpdate(ydoc, new Uint8Array(update), socket);
    };

    socket.on("receive-update", handleReceiveUpdate);

    const quill = new Quill(editorContainer, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, false] }, { font: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
      },
      placeholder: "Начните писать свой защищенный документ...",
      theme: "snow",
    });

    const generatedToolbar = editorRef.current.querySelector(".ql-toolbar");
    if (generatedToolbar) {
      toolbarRef.current.appendChild(generatedToolbar);
    }

    const binding = new QuillBinding(ytext, quill);

    return () => {
      socket.off("receive-update", handleReceiveUpdate);
      socket.disconnect();
      ydoc.destroy();
    };
  }, [documentId]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="sticky top-0 z-40 w-full bg-[#fcfcfc] border-b border-gray-200 shadow-sm flex justify-center">
        <div ref={toolbarRef} className="w-full max-w-[850px]" />
      </div>

      <div className="w-full flex-1 flex justify-center py-10 bg-gray-100">
        <div
          className="w-full max-w-[850px] bg-white shadow-xl min-h-[1100px] border border-gray-300 rounded-sm"
          style={{ cursor: "text" }}
        >
          <div ref={editorRef} />
        </div>
      </div>
    </div>
  );
};
