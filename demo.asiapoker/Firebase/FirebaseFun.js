// Firebase初始化
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
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    auth.useDeviceLanguage();
}

// 設置Recaptcha驗證監聽
function setupRecaptchaVerifier() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-button', {
        'size': 'invisible',
        'callback': (response) => {
            console.log('reCAPTCHA solved');
            signInWithPhoneNumber();
        }
    });

    window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
    });
}

// 發送OTP
function signInWithPhoneNumber() {
    console.log("Send OTP To:" + window.currPhoneNumber);
    var appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(window.currPhoneNumber, appVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            console.log('SMS sent!!!');
        })
        .catch((error) => {
            console.error('Error during signInWithPhoneNumber:', error);
        });
}

// 驗證OTP 
function verifyCode(code, type) {
    window.confirmationResult.confirm(code).then((result) => {
        console.log("User signed in successfully!!!");
        const user = result.user;

        switch(type)
        {
            //錢包登入
            case "Wallet":
                window.unityInstance.SendMessage("LoginView", "OnWalletOTPSuccess");
                break;

            //手機註冊
            case "Register":
                window.unityInstance.SendMessage("LoginView", "OnRegisterOTPSuccess");
                break;
            
            //忘記密碼
            case "LostPsw":
                window.unityInstance.SendMessage("LoginView", "OnLostPswOTPSuccess");
                break;
        }
      }).catch((error) => {
        console.log("Verify Code Error : " + error);

        switch(type)
        {
            //錢包登入
            case "Wallet":
                window.unityInstance.SendMessage("LoginView", "OnWalletLoginOTPCodeError");
                break;

            //手機註冊
            case "Register":
                window.unityInstance.SendMessage("LoginView", "OnRegisterOTPCodeError");
                break;
            
            //忘記密碼
            case "LostPsw":
                window.unityInstance.SendMessage("LoginView", "OnLostPswOTPCodeError");
                break;
        }
      });
}

window.userStatusDatabaseRefs = window.userStatusDatabaseRefs || {};
window.connectedRefs = window.connectedRefs || {};
window.callbacks = window.callbacks || {};
// 初始化在線狀態監測
// path = 監測路徑
// id = 監測ID
function initializePresence(path, id) {
    console.log("Start Listener Connection State:" + id);

    var userStatusDatabaseRef = firebase.database().ref(path);
    var connectedRef = firebase.database().ref(".info/connected");

    // 更新连接状态
    function updateStatus(isOnline) {
        userStatusDatabaseRef.update({
            online: isOnline,
            last_changed: firebase.database.ServerValue.TIMESTAMP
        });
    }

    var connectedCallback = function(snapshot) {
        if (snapshot.val() === false) {
            // 客户端已离线，更新状态
            updateStatus(false);
            return;
        }

        // 客户端在线，更新状态
        updateStatus(true);

        // 处理断线
        userStatusDatabaseRef.onDisconnect().update({
            online: false,
            last_changed: firebase.database.ServerValue.TIMESTAMP
        });
    };

    connectedRef.on("value", connectedCallback);

    // 存储引用和回调
    window.userStatusDatabaseRefs[id] = userStatusDatabaseRef;
    window.connectedRefs[id] = connectedRef;
    window.callbacks[id] = connectedCallback;
}

// 移除在線狀態監測
// 監測ID
function removePresenceListener(id) {
    console.log("Remove Listener Connection State:" + id);

    var connectedRef = window.connectedRefs[id];
    var connectedCallback = window.callbacks[id];

    if (connectedRef && connectedCallback) {
        connectedRef.off("value", connectedCallback);

        delete window.userStatusDatabaseRefs[id];
        delete window.connectedRefs[id];
        delete window.callbacks[id];
    }
}

//當文檔加載完成時
document.addEventListener('DOMContentLoaded', (event) => {
    initializeFirebase();
});
