Live : https://exercise-tracker-gray-rho.vercel.app/


The Exercise Tracker uses a real-time data connection so any changes to exercise entries (create, update, delete) are instantly reflected across all connected clients. The backend stores data in MongoDB and uses Mongoose for schema modeling. To deliver real-time updates, the server integrates Socket.IO (WebSockets) and emits events when the database changes. The frontend (React) subscribes to those Socket.IO events and updates the UI immediately — no manual refresh required.

This architecture gives a responsive, collaborative experience: if a user adds or edits an exercise from one device, other open sessions see the change instantly. The backend also exposes RESTful APIs for normal CRUD operations so clients that don’t support websockets still work.

Key components:

MongoDB (Atlas or self-hosted) for persistent storage.

Mongoose for schema & data validation.

Express for REST APIs.

Socket.IO for real-time push notifications.

React frontend using socket.io-client to listen for updates.



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
