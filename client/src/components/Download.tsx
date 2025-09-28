import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FileItem } from "../types";


export async function downloadProject(files: FileItem[]) {
    const zip = new JSZip();

    function addToZip(file: FileItem, folder: JSZip) {
      if (file.type === "file") {
        folder.file(file.name, file.content || "");
      } else if (file.type === "folder" && file.children) {
        const subFolder = folder.folder(file.name)!;
        file.children.forEach((child) => addToZip(child, subFolder));
      }
    }

    files.forEach((file) => addToZip(file, zip));

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "website-project.zip");
}
