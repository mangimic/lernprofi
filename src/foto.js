/* ============================================================
   📸 Foto-Helfer (Browser, kein calc): verkleinert ein Foto auf
   maxKante Pixel und liefert JPEG als Base64 + Daten-URL.
   Genutzt vom Schreib-Training und vom Aufsatz-Check, damit nie
   ein Riesen-Foto zum Server wandert.
   ============================================================ */
export function bildVerkleinern(datei, maxKante, qualitaet) {
  return new Promise((erfuellt, abgelehnt) => {
    const leser = new FileReader();
    leser.onerror = () => abgelehnt(new Error("lesen"));
    leser.onload = () => {
      const img = new Image();
      img.onerror = () => abgelehnt(new Error("bild"));
      img.onload = () => {
        const f = Math.min(1, maxKante / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.width * f));
        c.height = Math.max(1, Math.round(img.height * f));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL("image/jpeg", qualitaet);
        erfuellt({ dataUrl, base64: dataUrl.split(",")[1] || "" });
      };
      img.src = leser.result;
    };
    leser.readAsDataURL(datei);
  });
}
