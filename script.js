const API_KEY = "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";
const submitButton = document.getElementById('submit');
const outPutElement = document.getElementById('output');
const inputElement = document.querySelector("input");
const historyElement = document.querySelector('.history'); // Assuming 'history' is a class
const buttonElement = document.querySelector('button');

function changeInput(value) {
    inputElement.value = value;
}

async function getMessage(retries = 3, delay = 1000) {
    const options = {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: inputElement.value }],
            max_tokens: 100
        })
    };

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', options);
        if (!response.ok) {
            if (response.status === 429 && retries > 0) {
                const retryAfter = parseInt(response.headers.get('Retry-After')) || 5; // Default to 5 seconds if no Retry-After header
                console.log(`Rate limited. Retrying after ${retryAfter} seconds.`);
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                return getMessage(retries - 1, delay * 2); // Retry with reduced retries and increased delay
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        
        const data = await response.json();
        console.log(data);

        if (data.choices && data.choices.length > 0) {
            outPutElement.textContent = data.choices[0].message.content;
            if (data.choices[0].message.content) {
                const pElement = document.createElement('p');
                pElement.textContent = inputElement.value;
                pElement.addEventListener("click", () => changeInput(pElement.textContent));
                historyElement.append(pElement);
            }
        } else {
            console.error("No choices returned from API");
        }
    } catch (error) {
        console.error(error);
    }
}

function clearInput() {
    inputElement.value = '';
}

submitButton.addEventListener("click", getMessage);
buttonElement.addEventListener("click", clearInput);
