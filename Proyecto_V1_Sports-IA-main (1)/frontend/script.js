let file

document.getElementById("imageInput").addEventListener("change", function(event) {
    file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById("imagePreview");
            imgElement.src = e.target.result;
            imgElement.style.display = "block";
        };

        reader.readAsDataURL(file);
    }
});

async function sendData() {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData // No necesitamos especificar el Content-Type, FormData lo maneja automáticamente
    });

    const data = await response.json();
    return data.resultado;
}

document.getElementById("classifyButton").addEventListener("click", function() {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<p>⏳ Procesando imagen...</p>";
    respuesta = sendData()

    sendData().then(resultado => {
        setTimeout(() => {
            resultDiv.innerHTML = `<p>🏅 Resultado: ${resultado}</p>`;
        }, 1000);
    });


});