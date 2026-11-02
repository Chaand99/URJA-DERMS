/**
 * ============================================================================
 * AUTHENTICATION & RBAC MODULE (js/auth.js)
 * Manages user login sessions, Firebase Auth gates, and role lookup.
 * ============================================================================
 */

import { auth, db, ref, set, get } from "./firebase.js";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

/**
 * Checks the persistent user session on boot and configures profile/RBAC
 */
export function initAuthGate(onAuthenticatedCallback) {
    const loginModal = document.getElementById("loginModalContainer");
    if (loginModal) {
        loginModal.style.display = "none";
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log(`🔐 Active Authenticated Session: ${user.email} (UID: ${user.uid})`);

            // Fetch dynamic profile and role from Realtime Database
            const profile = await getUserProfile(user.uid);

            // Update Profile Avatar
            const avatarImg = document.querySelector(".action-item.profile img");
            if (avatarImg) {
                if (profile.role === "Admin" || user.email?.includes("admin")) {
                    avatarImg.src = "assets/images/adminavatar.jpg";
                } else if (user.photoURL) {
                    avatarImg.src = user.photoURL;
                } else {
                    const initials = encodeURIComponent(user.email?.substring(0, 2).toUpperCase() || "OP");
                    avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=2563eb&color=fff`;
                }
                avatarImg.title = `${user.email} (${profile.role || "Operator"})`;
            }

            if (loginModal) loginModal.style.display = "none";
            if (typeof onAuthenticatedCallback === "function") onAuthenticatedCallback(user, profile);
        } else {
            console.warn("🔒 No active session detected.");
            // If on main application page and not in a local session, handle route protection
            if (window.location.pathname.endsWith("index.html") || window.location.pathname.endsWith("/")) {
                if (loginModal) {
                    loginModal.style.display = "flex";
                }
            }
        }
    });

    // Wire up sidebar logout button if present
    const logoutBtn = document.getElementById("sidebarLogoutBtn") || document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log("👋 Logging out active user session...");
            await handleLogout();
            window.location.href = "login.html";
        });
    }
}

/**
 * Look up user metadata and role from database
 */
export async function getUserProfile(uid) {
    try {
        const userSnap = await get(ref(db, `users/${uid}`));
        if (userSnap.exists()) {
            return userSnap.val();
        }
    } catch (error) {
        console.warn("Could not query user profile from database:", error.message);
    }
    return { role: "Operator", assignedNode: "node04A" };
}

/**
 * Registers a new user and saves their profile in Realtime Database
 */
export async function handleSignUp(email, password, role = "Consumer") {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userRef = ref(db, `users/${user.uid}`);
        await set(userRef, {
            email: user.email,
            role: role,
            assignedNode: "node04A",
            createdAt: Date.now()
        });

        return user;
    } catch (error) {
        console.error("Sign up failed:", error.message);
        throw error;
    }
}

/**
 * Logs in an existing user with real Firebase Authentication
 */
export function handleLogin(email, password) {
    return signInWithEmailAndPassword(auth, email.trim(), password);
}

/**
 * Signs out the active user session
 */
export function handleLogout() {
    return signOut(auth);
}
