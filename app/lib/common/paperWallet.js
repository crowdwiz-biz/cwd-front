import jsPDF from "jspdf";
import QRCode from "qrcode";
import WalletDb from "stores/WalletDb";

import { getLogoPDF } from "branding";
var image = getLogoPDF();

const _createPaperWalletAsPDF = function (
    ownerkeys,
    activeKeys,
    memoKey,
    accountName
) {
    const width = 850,
        height = 1180, //mm
        lineMargin = 15,
        qrSize = 50,
        textMarginLeft = qrSize + 12,
        qrMargin = 10,
        qrRightPos = width - qrSize - qrMargin,
        logoWidth = 40,
        logoHeight = 12;

    let rowHeight = logoHeight + 50;
    const keys = [activeKeys, ownerkeys, memoKey];
    const keysName = ["Active Key", "Owner Key", "Memo Key"];

    let locked = WalletDb.isLocked();

    const pdf = new jsPDF({
        orientation: "portrait",
        format: [width, height],
        compressPdf: true
    });

    const checkPageH = (pdfInstance, currentPageH, maxPageH) => {
        if (currentPageH >= maxPageH) {
            pdfInstance.addPage();
            rowHeight = 10;
        }
        return pdf.internal.getNumberOfPages();
    };

    const keyRow = publicKey => {
        let currentPage = checkPageH(pdf, rowHeight, 500);
        let privateKey = null;
        if (!locked) {
            privateKey = WalletDb.getPrivateKey(publicKey);
            if (!!privateKey) {
                privateKey = privateKey.toWif();
                pdf.setFontSize(12);
            }
        }
        gQrcode(publicKey, qrMargin, rowHeight + 25, currentPage);
        if (!locked && !!privateKey) {
            gQrcode(privateKey, qrRightPos, rowHeight + 25, currentPage);
        }
        pdf.setFontSize(14);
        pdf.setTextColor(150);
        pdf.text("PublicKey", textMarginLeft, rowHeight + 37);
        pdf.setTextColor(0);
        pdf.text(publicKey, textMarginLeft, rowHeight + 45);
        if (!locked) {
            pdf.setFontSize(14);
            pdf.setTextColor(150);
            pdf.text("PrivateKey", textMarginLeft, rowHeight + 57);
            if (!!privateKey) {
                pdf.setTextColor(0);
                pdf.text(privateKey, textMarginLeft, rowHeight + 65);
            } else {
                pdf.text("Not found.", textMarginLeft, rowHeight + 65);
            }
        }
        rowHeight += 57;
    };

    const gQrcode = (qrcode, rowWidth, rowHeight, currentPage) => {
        QRCode.toDataURL(qrcode)
            .then(url => {
                pdf.setPage(currentPage);
                pdf.addImage(url, "JPEG", rowWidth, rowHeight, qrSize, qrSize);
            })
            .catch(err => {
                console.error(err);
            });
    };

    let img = new Image();
    img.src = image;
    pdf.addImage(
        img,
        "PNG",
        lineMargin,
        25,
        logoWidth,
        logoHeight,
        "",
        "MEDIUM"
    );
    pdf.setFontSize(24);
    pdf.text("Account:", 130, rowHeight - 33);
    pdf.text(accountName, 165, rowHeight - 33);

    pdf.setDrawColor(0);
    pdf.line(0, rowHeight - 12, width, rowHeight - 12);

    let content = keys.map((publicKeys, index) => {
        if (index >= 1) {
            rowHeight += 35; // add margin-top for block
        }
        checkPageH(pdf, rowHeight, 400);

        pdf.setFontSize(30);
        pdf.text(keysName[index], 15, rowHeight + 12);

        pdf.setFontSize(18);
        pdf.text("Public", 26, rowHeight + 24);

        if (!locked) {
            pdf.setFontSize(18);
            pdf.text("Private", 256, rowHeight + 24);
        }
        // pdf.line(lineMargin, rowHeight + 9, width - lineMargin, rowHeight + 9);
        if (typeof publicKeys === "string") {
            pdf.setFontSize(16);
            keyRow(publicKeys);
            pdf.setDrawColor(150);
            pdf.line(
                lineMargin,
                rowHeight + 19,
                width - lineMargin,
                rowHeight + 19
            );
        } else {
            publicKeys.map(publicKey => {
                pdf.setFontSize(16);
                keyRow(publicKey);
                pdf.setDrawColor(150);
                pdf.line(
                    lineMargin,
                    rowHeight + 19,
                    width - lineMargin,
                    rowHeight + 19
                );
            });
        }
    });

    Promise.all(content).then(() => {

        let host = window.location.hostname;
        if(["127.0.0","192.168"].includes(host.substring(0, 7))) {
            host = "backup.cwd.global"
        }

        pdf.save(
            host +
            "-paper-wallet-" +
            (locked ? "public-" : "private-") +
            accountName +
            ".pdf"
        );
    });
};

const createPaperWalletAsPDF = function (account) {
    let getKeys = function (target) {
        let key_auths = account.get(target).get("key_auths");
        return key_auths.map(a => a.get(0));
    };

    _createPaperWalletAsPDF(
        getKeys("owner"),
        getKeys("active"),
        account.get("options").get("memo_key"),
        account.get("name")
    );
};

export { createPaperWalletAsPDF };
