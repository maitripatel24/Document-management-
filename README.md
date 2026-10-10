# Team Docs — mobile app

A mobile app (Android + iPhone) for your team to store documents and information, with an admin panel.

**What it does**
- **Login** with email + password. There is no public sign-up: only an admin can create accounts.
- **Documents**: everyone signed in can see, search, filter by category, and add documents (any file up to 50 MB, plus notes).
- **Sharing**: send a document to **WhatsApp**, **Gmail/email**, or any other app on the phone. You can send the file itself or a download link.
- **Admin tab** (admins only): add team members, make someone admin or member, and block or unblock access. Admins can also edit or delete any document.
- Members can edit and delete only the documents they added themselves.

Built with Expo (React Native) and Firebase (login, database, file storage). You don't need to run a server.

---

## 1. Create the Firebase backend (one time, ~10 minutes)

1. Go to https://console.firebase.google.com and click **Create a project**.
2. **Add a Web app**: open Project settings → General → *Your apps* and click the `</>` icon. Copy the `firebaseConfig` values into [`src/firebaseConfig.js`](src/firebaseConfig.js).
3. **Authentication** → Get started → **Email/Password** → Enable.
4. **Firestore Database** → Create database → *Production mode*. Then open the **Rules** tab, paste the contents of [`firestore.rules`](firestore.rules), and click **Publish**.
5. **Storage** → Get started. File storage needs the **Blaze (pay-as-you-go)** plan, which includes a free monthly allowance. A small team usually pays nothing. Then open the **Rules** tab, paste [`storage.rules`](storage.rules), and click **Publish**. If Firebase asks to let Storage read Firestore, click **Allow**.

## 2. Run the app on your phone

```bash
npm install
npx expo start
```

Install **Expo Go** from the Play Store or App Store and scan the QR code. Your phone and PC must be on the same Wi-Fi.

## 3. Create the admin account

On the login screen, tap **First-time setup: create admin account**. This works only once. After that, the admin adds everyone else from the **Admin** tab, and each person signs in with the email and temporary password the admin set. Anyone can change their password from **Profile → Change password**.

## 4. Build an installable app for your team

```bash
npx eas-cli@latest build -p android --profile preview
```

This builds an `.apk` file in the cloud (you need a free Expo account). Send the download link to your team. For the Play Store or App Store, use `--profile production` and `npx eas-cli@latest submit`.

---

## Project layout

| Path | What it is |
|---|---|
| `App.js` | Navigation: login → tabs (Documents / Admin / Profile) |
| `src/firebase.js` | Firebase connection |
| `src/AuthContext.js` | Logged-in user, role, blocked-user handling |
| `src/share.js` | WhatsApp / Gmail / share-sheet logic |
| `src/screens/` | All screens |
| `firestore.rules`, `storage.rules` | Security: who can read, add, edit, or delete |

## Notes
- **Data model**: `users/{uid}` stores `{name, email, role: admin|member, active}`. `documents/{id}` stores `{title, category, notes, fileUrl, fileName, ...}`.
- **Blocked users** are logged out right away and cannot read any data. Deleting a login completely is done in the Firebase console under Authentication.
- **Download links** shared over WhatsApp or email work for anyone who has the link. To keep a file private, use **Share file**, which sends the file itself.
- **Categories** are set in `CATEGORIES` in `src/ui.js`.
