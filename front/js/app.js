const { startRegistration } = SimpleWebAuthnBrowser;

const registerFunc = async () => {
    const resp = await fetch('/generate-registration-options');
    const responseData = await resp.json();

    if (responseData && responseData.challenge) {
        let attResp;
        try {
            attResp = await startRegistration({ optionsJSON: responseData });
        } catch (error) {
            if (error.name === 'InvalidStateError') {
                resultElement.innerText = 'Error: Authenticator was probably already registered by user';
            } else {
                resultElement.innerText = error;
            }
            throw error;
        }

        const verificationResp = await fetch('/verify-registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(attResp),
        });
        const verificationJSON = await verificationResp.json();
        if (verificationJSON && verificationJSON.verified) {
            resultElement.innerHTML = 'Success!';
        } else {
            resultElement.innerHTML = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                verificationJSON,
            )}</pre>`;
        }
    }
}

