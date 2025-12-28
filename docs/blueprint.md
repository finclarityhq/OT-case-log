# **App Name**: OT Case Log – Anesthesia

## Core Features:

- Case Logging: Input and store patient demographics (de-identified), pre-anesthetic status, surgical details, anesthesia technique, intraoperative course, and postoperative analgesia data. Includes data validation to maintain integrity.
- Quick Data Entry: UI optimized for minimal typing using dropdowns, toggles, and auto-suggestions for frequently used surgeries and anesthesia techniques. Remembers last-used anesthesia technique for faster entry.
- Data Visualization Dashboard: Display a dashboard with total cases logged, monthly case count, ASA grade distribution, and common anesthesia techniques for quick insights.
- Case Search & Filtering: Search and filter cases by date range, ASA grade, surgery type, and anesthesia technique. Sort cases by date (newest first).
- Data Export: Export case data to CSV/Excel format for audit and research purposes. Includes monthly case summaries, ASA distribution, technique usage, and complication rates.
- Clinical Decision Tool: AI tool that reviews entries looking for errors and providing non-judgmental soft alerts for unusual ASA-technique combinations.
- Secure Data Storage: Secure storage of all case data using Firebase. Includes optional Firebase Authentication for user accounts. Offline-first support.

## Style Guidelines:

- Primary color: Soft teal (#63BDBD) to create a calming, medical feel.
- Background color: Soft white (#F0F8FF), almost-white to ensure comfortable contrast and readability.
- Accent color: Pale seafoam green (#D1FFBD) for interactive elements to highlight and guide the user.
- Body and headline font: 'Inter', a sans-serif font for a clean, modern, highly readable interface.
- Use minimal medical icons that match the selected medical teal color, ensure quick identification of information without adding clutter.
- Rounded buttons and clear, structured layouts. Consistent spacing for easy scanning. Adhere to Material Design principles.
- Subtle transitions and animations when navigating between cases. Gentle animations when new data is added.