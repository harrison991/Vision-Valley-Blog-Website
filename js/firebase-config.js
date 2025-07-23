// Firebase Configuration for Vision Valley Blog

// Check if the firebase object exists before trying to initialize
function initializeFirebase() {
    console.log('Checking Firebase availability...');
    
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK is not loaded. Make sure the Firebase scripts are included before this file.');
        return false;
    }
    
    // Check if Firebase is already initialized
    if (firebase.apps && firebase.apps.length) {
        console.log('Firebase is already initialized. Using existing instance.');
        return true;
    }    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAhzrGFtLDbPQ1M2uNNu8t8y0TIlwnqTv8",
        authDomain: "vision-valley-blog-website.firebaseapp.com", 
        projectId: "vision-valley-blog-website",
        storageBucket: "vision-valley-blog-website.firebasestorage.app",
        messagingSenderId: "125235791987",
        appId: "1:125235791987:web:f0191806bc31e17a9ec206",
        measurementId: "G-1VLE3MCEV7"
    };
    
    console.log('Initializing Firebase with config:', JSON.stringify(firebaseConfig, null, 2));
    
    // Initialize Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Call the initialization function
const firebaseInitialized = initializeFirebase();

// Get a reference to the Firebase Authentication service if available
let firebaseAuth = null;

if (firebaseInitialized && firebase.auth) {
    firebaseAuth = firebase.auth();
    
    // Log authentication state changes for debugging
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('Firebase user is signed in:', user.email);
            console.log('User details:', {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                emailVerified: user.emailVerified,
                providers: user.providerData.map(p => p.providerId)
            });
            
            // Store user in session for use across the app
            if (typeof API !== 'undefined' && API.auth && API.auth.saveFirebaseSession) {
                console.log('Saving Firebase user to session');
                API.auth.saveFirebaseSession(user);
            }
        } else {
            console.log('No Firebase user is signed in');
        }
    });
} else {
    console.warn('Firebase Auth is not available. Authentication features will be limited.');
}

// Set up auth state change listener
firebaseAuth.onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in
        // If we're not on the login page and user details aren't in session storage,
        // save them to session storage
        if (!window.location.pathname.includes('login.html') && !API.auth.getSession()) {
            API.auth.saveFirebaseSession(user);
        }
    } else {
        // User is signed out
        if (!window.location.pathname.includes('login.html')) {
            // If we're not on the login page, check if we have a session
            const session = API.auth.getSession();
            
            // If no session or if we have a Firebase session but no Firebase user,
            // redirect to login page
            if (!session || (session.authMethod === 'firebase' && !user)) {
                window.location.href = '../admin/login.html';
            }
        }
    }
});
