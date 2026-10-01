// ==========================================
// Market DZ - Firebase App
// ==========================================

// 1. استيراد Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// 2. تهيئة Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 3. متغيرات عامة
let currentUser = null;
let currentChatWith = null;

// ==========================================
// 4. تسجيل الدخول والخروج
// ==========================================

window.registerUser = async function(email, password, name) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    alert("🎉 تم إنشاء الحساب بنجاح");
    return true;
  } catch (e) {
    alert("❌ " + e.message);
    return false;
  }
};

window.loginUser = async function(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ تم تسجيل الدخول");
    return true;
  } catch (e) {
    alert("❌ " + e.message);
    return false;
  }
};

window.logoutUser = async function() {
  await signOut(auth);
  alert("تم تسجيل الخروج");
  location.reload();
};

// 5. مراقبة تسجيل الدخول (يبقى محفوظًا)
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    const accBtn = document.querySelector(".account");
    if (accBtn) accBtn.textContent = user.displayName || user.email;
  }
});

// ==========================================
// 6. نشر منتج
// ==========================================

window.publishProductFirebase = async function(product) {
  if (!currentUser) { alert("سجّل الدخول أولاً"); return false; }
  try {
    await addDoc(collection(db, "products"), {
      ...product,
      ownerEmail: currentUser.email,
      ownerName: currentUser.displayName || "مستخدم",
      createdAt: serverTimestamp()
    });
    alert("✅ تم نشر المنتج");
    return true;
  } catch (e) {
    alert("❌ " + e.message);
    return false;
  }
};

// ==========================================
// 7. عرض المنتجات (لكل المستخدمين)
// ==========================================

window.loadProductsFirebase = async function() {
  const snap = await getDocs(collection(db, "products"));
  const list = [];
  snap.forEach(d => list.push({ id: d.id, ...d.data() }));
  return list;
};

// ==========================================
// 8. حذف منتج
// ==========================================

window.deleteProductFirebase = async function(id) {
  try {
    await deleteDoc(doc(db, "products", id));
    alert("تم الحذف");
    return true;
  } catch (e) {
    alert("❌ " + e.message);
    return false;
  }
};

// ==========================================
// 9. الدردشة
// ==========================================

window.sendMessageFirebase = async function(toEmail, toName, text) {
  if (!currentUser) { alert("سجّل الدخول"); return; }
  await addDoc(collection(db, "messages"), {
    from: currentUser.email,
    fromName: currentUser.displayName || "مستخدم",
    to: toEmail,
    toName: toName,
    text: text,
    createdAt: serverTimestamp()
  });
};

window.loadChatsFirebase = async function() {
  if (!currentUser) return [];
  const snap = await getDocs(collection(db, "messages"));
  const list = [];
  snap.forEach(d => {
    const m = d.data();
    if (m.from === currentUser.email || m.to === currentUser.email) {
      list.push({ id: d.id, ...m });
    }
  });
  return list;
};

// ==========================================
// 10. جلب معلومات المستخدم الحالي
// ==========================================

window.getCurrentUser = function() {
  return currentUser;
};

// ==========================================
// 11. مراقبة حالة تسجيل الدخول
// ==========================================

window.onUserChange = function(callback) {
  onAuthStateChanged(auth, callback);
};

