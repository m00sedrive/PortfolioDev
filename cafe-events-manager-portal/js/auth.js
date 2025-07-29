import { showTab } from './tabs.js'; // If you have tabs logic in another module

let auth0Client;

async function configureClient() {
    auth0Client = await createAuth0Client({
        domain: "dev-pdjpzwemxwlkhmhj.us.auth0.com",         // e.g., dev-abc123.us.auth0.com
        clientId: "WOKGMu3MSuyqJpdG0prN8qGWTpCrE1y1D",    // from your Auth0 application
        cacheLocation: "localstorage",
        authorizationParams: {
            redirect_uri: window.location.origin
        }
    });
}

async function updateUI() {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');

    if (isAuthenticated) {
        const user = await auth0Client.getUser();
        userName.textContent = `Hello, ${user.name}`;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        document.querySelector('.container').style.display = 'block';
    } else {
        userName.textContent = '';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.querySelector('.container').style.display = 'none';
    }
}

window.onload = async () => {
    await configureClient();

    // Handle redirect back from Auth0
    if (window.location.search.includes("code=") &&
        window.location.search.includes("state=")) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }

    updateUI();

    document.getElementById('loginBtn').addEventListener('click', () => {
        auth0Client.loginWithRedirect();
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    });
};
