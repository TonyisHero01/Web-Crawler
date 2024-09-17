### Local starting
- In "Back" repository run command: node index.js
- In "Front" repository run command: npm run dev
### Download dependencies if needed: "npm i" or "npm i -g pnpm", "pnpm i" and "pip install -r requirement.txt"

### In the user interface page you can type your original url and set depth of crawler

### Architecture 
#### Server:
Implemented by Node + python. Python crawles pages and save into MongoDB. Node using GraphQL send request to MongoDB and then send results to client.
#### Client:
Implemented by Node React. Using library relation-graph-react to show URL relation graph on the page.