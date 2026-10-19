// Stock photos (Unsplash) used for sample content. Components fall back to drawn art on error.
export const photo = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const PH = {
  beach: "1507525428034-b723cf961d3e", resort: "1540541338287-41700207dee6", pool: "1566073771259-6a8506099945",
  waterfall: "1432405972618-c60b0225b8f9", rooftop: "1517248135467-4c7edcad34c4", food: "1414235077428-338989a2e8c0",
  lake: "1501594907352-04cda38ebc29", museum: "1554907984-15263bfd63bd", lounge: "1470337458703-46ad1756a187",
  waterpark: "1520250497591-112f2f40a3f4", boat: "1544551763-46a013bb70d5", camp: "1504280390367-361c6d9f38f4",
  cafe: "1495474472287-4d71bcdd2085", mountain: "1506905925346-21bda4d32df4", hills: "1469474968028-56623f02e42e",
  beach2: "1519046904884-53103b34b206", crowd: "1492684223066-81342ee5ff30", concert: "1516450360452-9312f5e86fc7",
  stage: "1514525253161-7a46d19cd819", party: "1533174072545-7a4b6ad7a6c3", friends: "1528605248644-14dd04022da1",
  friends2: "1529156069898-49953e39b3ac", friends3: "1511632765486-a01980e01a18",
  p1: "1531123897727-8f129e1688ce", p2: "1522529599102-193c0d76b5b6", p3: "1494790108377-be9c29b29330",
  p4: "1507003211169-0a1dd7228f2d", p5: "1438761681033-6461ffad8d80", p6: "1500648767791-00dcc994a43e",
} as const;

// Downscale an uploaded image so demo posts fit in browser storage.
export async function fileToMedia(file: File): Promise<{ type: "image" | "video"; src: string }> {
  if (import.meta.env.VITE_API_URL) return (await import("./remote")).uploadFile(file); // Cloudinary in live mode
  if (file.type.startsWith("video/")) return Promise.resolve({ type: "video", src: URL.createObjectURL(file) });
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 1080 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res({ type: "image", src: c.toDataURL("image/jpeg", 0.72) });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
