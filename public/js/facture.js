document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    showFeedback("ID fiche manquant", "error");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/dentiste/worksheets/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
      doc.text(`- ${a.name} (${a.description}) : ${a.price} €`, 20, y);
    });

    y += 20;
    doc.text(`Total : ${workSheet.acts.reduce((sum, a) => sum + a.price, 0)} €`, 20, y);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  } catch (err) {
    console.error(err);
    showFeedback(`Erreur génération facture : ${err.message}`, "error");
  }
});
