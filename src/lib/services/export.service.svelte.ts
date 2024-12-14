import html2pdf from "html2pdf.js";

export const Export2Word = async (content: string, filename: string = "") => {
    var preHtml =
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    var postHtml = "</body></html>";
    var html = preHtml + content + postHtml;

    var blob = new Blob(["\ufeff", html], {
        type: "application/msword",
    });

    // Specify link url
    var url = "data:application/vnd.ms-word;charset=utf-8," +
        encodeURIComponent(html);

    // Specify file name
    filename = filename ? filename + ".doc" : "document.doc";

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    // if(navigator.msSaveOrOpenBlob ){
    //     navigator.msSaveOrOpenBlob(blob, filename);
    // }else{
    // Create a link to the file
    downloadLink.href = url;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
    //}

    document.body.removeChild(downloadLink);
};

function dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;
}

export const getDOC = async (content: string, filename: string = "ESV") => {
    // Create a temporary div to manipulate the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Convert all images to base64 and add size constraints
    const images = tempDiv.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(async (img) => {
        try {
            const response = await fetch(img.src);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    img.src = reader.result as string;
                    // Add explicit width and height using Word-compatible styles
                    img.style.width = '500px';
                    img.style.height = 'auto';
                    img.style.maxWidth = '100%';
                    // Add Word-specific attributes
                    img.setAttribute('width', '500');
                    img.setAttribute('height', 'auto');
                    resolve(null);
                };
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image:', error);
            return null;
        }
    }));

    var preHtml =
        `<html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
         <head>
           <meta charset='utf-8'>
           <title>Export HTML To Doc</title>
           <style>
             /* Word-specific styles */
             body { width: 100%; margin: 0; padding: 20px; }
             img { max-width: 500px; width: 500px; height: auto; display: block; margin: 10px 0; }
             p { margin: 0; padding: 0; }
             table { width: 100%; }
             td { padding: 5px; }
           </style>
         </head>
         <body>`;
    var postHtml = "</body></html>";
    var html = preHtml + tempDiv.innerHTML + postHtml;

    var blob = new Blob(["\ufeff", html], {
        type: "application/msword",
    });

    // Specify link url
    var url = "data:application/vnd.ms-word;charset=utf-8," +
        encodeURIComponent(html);
    const res = await fetch(url);
    return res.blob();
};

export const OpenAsHTML = async (
    content: string,
    filename: string = "",
    bible: string = "",
) => {
    let preHtml = `
    <html><head>
        <title>${filename}</title>
        <style>
            .exportDiv {
                font-family: "Times New Roman", Times, serif;
                font-size: 18pt;
                margin: 0.75in;
                margin-top: 0.5in;
                margin-bottom: 0.75in;
                margin-left: 0.75in;
                margin-right: 0.75in;
            }
            .outer {
                height: 0.25in;
                display: block;
            }
            .button {
                margin-left: 2%;
                color: white;
                font-weight: bold;
                cursor: pointer;
                height: 32px;
                width: 32px;
            }
        </style>
        <script type="text/javascript">
            function bp() {document.getElementById("button").style.display = "none";}
            function ap() {document.getElementById("button").style.display = "block";}
        </script>
    </head>
    <body onbeforeprint="bp()" onafterprint="ap()">
    <div class="outer">
        <div id="button" class="button" onclick="window.close()">
           <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z"/></svg>
        </div>
    </div>
    <div class="exportDiv">
    `;
    const postHtml = `</div>
    <script src="https://www.biblegateway.com/public/link-to-us/tooltips/bglinks.js" type="text/javascript"></script>
    <script type="text/javascript">
        BGLinks.version = "${bible === "any" ? "ESV" : bible}";
        BGLinks.linkVerses();
    </script>
    </body></html>`;
    const html = preHtml + content + postHtml;
    // console.log('html', html)
    // let encoded = encodeURIComponent(html);
    const win = window.open("about:blank", "_blank");
    if (win) {
        win.document.write(html);
        win.focus();
    }

    // let a = document.createElement(`a`);
    // a.target = `_blank`;
    // a.href = `data:text/html;charset=utf-8,${encoded}`;
    // a.style.display = `none`;
    // document.body.appendChild(a); // We need to do this,
    // a.click();                    // so that we can do this,
    // document.body.removeChild(a); // after which we do this.
};

export const Export2HTML = async (content: string, filename: string = "") => {
    let preHtml = "<html><head><title>" + filename +
        '</title></head><body><div class="exportDiv">';
    preHtml += `<style>
        .exportDiv {
            font-family: "Times New Roman", Times, serif;
            font-size: 16pt;
            margin: 0.75in;
        }
    </style>`;
    const postHtml = "</div></body></html>";
    const html = preHtml + content + postHtml;

    const blob = new Blob(["\ufeff", html], {
        //type: 'application/msword'
        type: "text/html",
    });

    // Specify link url
    const url = "data:text/html;charset=utf-8," + encodeURIComponent(html);

    // Specify file name
    filename = filename ? filename + ".html" : "document.html";

    // Create download link element
    const downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    // if(navigator.msSaveOrOpenBlob ){
    //     navigator.msSaveOrOpenBlob(blob, filename);
    // }else{
    // Create a link to the file
    downloadLink.href = url;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
    //}

    document.body.removeChild(downloadLink);
};

export const getPDF = async (content: string, title: string) => {
    return new Promise((resolve) => {
        const opt = {
            margin: 0.75,
            filename: title + ".pdf",
            image: {
                type: "jpeg",
                quality: 0.98,
                windowWidth: 1920,
                useCORS: true,
                enableLinks: true,
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: true,
                allowTaint: true,
                imageTimeout: 15000,
                onclone: (clonedDoc: Document) => {
                    // Ensure all images are loaded before conversion
                    const images = Array.from(clonedDoc.getElementsByTagName('img'));
                    return Promise.all(images.map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    }));
                }
            },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };
        
        (html2pdf() as any)
            .set(opt)
            .from(content)
            .toPdf()
            .output("blob")
            .then((result: Blob) => {
                resolve(result);
            })
            .catch((error: any) => {
                console.error('PDF generation error:', error);
                resolve(null);
            });
    });
};
