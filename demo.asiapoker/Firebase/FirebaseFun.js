//Firebase初始化
function initializeFirebase() {
    // Firebase 配置
    const firebaseConfig = {
        apiKey: "AIzaSyDbgc-2YxTTzwZdmKCG57Fz6dFK9LCPAxY",
        authDomain: "asia-poker-5959b.firebaseapp.com",
        databaseURL: "https://asia-poker-5959b-default-rtdb.firebaseio.com",
        projectId: "asia-poker-5959b",
        storageBucket: "asia-poker-5959b.appspot.com",
        messagingSenderId: "320309465715",
        appId: "1:320309465715:web:20b2b12ee48ffb7929d006"
    };

    // 初始化 Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    auth.useDeviceLanguage();
    //auth.settings.appVerificationDisabledForTesting = true;     //跳過recaptcha 驗證

    console.log("Firebase Init!");
}

//觸發Recaptcha驗證
function triggerRecaptcha(phoneNumber) {
    setupRecaptchaVerifier(phoneNumber);
}

//設置Recaptcha驗證監聽
function setupRecaptchaVerifier(phoneNumber) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-button', {
        'size': 'invisible',
        'callback': (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            // This callback function can be handled in Unity or here
            console.log('reCAPTCHA solved');
            signInWithPhoneNumber(phoneNumber);
        }
    });
}

//發送OTP
function signInWithPhoneNumber(phoneNumber) {
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            console.log('SMS sent!!!');
        })
        .catch((error) => {
            console.error('Error during signInWithPhoneNumber:', error);
        });
}

// Initialize Firebase and Recaptcha when the document is ready
document.addEventListener('DOMContentLoaded', (event) => {
    initializeFirebase();
    setupRecaptchaVerifier();
});
