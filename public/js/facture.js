document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    showFeedback("ID fiche manquant", "error");
    return;
  }

  try {
    const res = await fetch(`/dentiste/worksheets/${id}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Impossible de récupérer la fiche");

    const { workSheet } = await res.json();

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Facture", 20, 20);
    doc.setFontSize(12);
    doc.text(`Numéro de fiche : ${workSheet.numFiche}`, 20, 40);
    doc.text(`Patient : ${workSheet.nomPatient} ${workSheet.prenomPatient}`, 20, 50);
    doc.text(`Email : ${workSheet.emailPatient}`, 20, 60);
    doc.text(`Date : ${new Date(workSheet.createdAt).toLocaleDateString()}`, 20, 70);

    let y = 90;
    doc.text("Actes :", 20, y);
    workSheet.acts.forEach((a) => {
      y += 10;
      doc.text(`- ${a.name} (${a.description}) : ${Number(a.price).toFixed(2)} € HT`, 20, y);
    });

    const totalHT = workSheet.acts.reduce((sum, a) => sum + Number(a.price), 0);
    const tva = totalHT * 0.2;
    const totalTTC = totalHT + tva;

    y += 20;
    doc.text(`Total HT : ${totalHT.toFixed(2)} €`, 20, y);
    y += 10;
    doc.text(`TVA (20 %) : ${tva.toFixed(2)} €`, 20, y);
    y += 10;
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} €`, 20, y);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (err) {
    console.error(err);
    showFeedback(`Erreur génération facture : ${err.message}`, "error");
  }
});
