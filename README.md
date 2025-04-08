# Expense Tracker 💸

This is a technical assesment project for the Full Stack Software Engineer role at [Markopolo.ai](https://www.markopolo.ai/)

## Tech Stack
- Nest Js
- Rabbit MQ
- React JS
- Mongo DB

## Use in Production

- [Live url](https://exp-tracker-by-taus.vercel.app)
- [Api Docs](https://expense-tracker-full-stack-production.up.railway.app/docs/api)



## Setup In Local
- Clone the repository
```bash
git clone https://github.com/shehjad-dev/expense-tracker-full-stack.git
```

<details>
<summary>DATABASE</summary>

1. Create a MongoDB Atlas Account. After signing up, create a new project (e.g., name it "ExpenseTracker").

2. Create a Cluster and then create a database named - "expensesDB"

3. Inside "expensesDB" there will 2 collections - expenses, categories (no need to create manually, if they dont exist they will be added automatically from code)

4. Get Your MongoDB Connection String, that looks something like - 
```bash
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
```

5. Replace <username>, <password>, and <dbname> with your values that you can get from MONGODB Atlas dashboard.

</details>

<details>
<summary>Backend</summary>

1. Open docker compose in your pc. Download docker compose from [here](https://docs.docker.com/compose/install/)
<br />


2. Run this command in a terminal to setup rabbit mq instance through docker 
```bash
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:4.0-management
```

3. In another terminal, go to backend folder
```bash
cd backend
```

4. Create .env file in root backend folder
```bash
NODE_ENV=development
MONGO_URI=MONGO_URI
MONGO_DB_NAME=expensesDB
RABBITMQ_URL=amqp://localhost:5672
```

5. Start Dev server in backend
```bash
npm run start:dev
```
</details>

<details>
<summary>Frontend</summary>

1. In another terminal Go to frontend folder
```bash
cd frontend
```

2. Create .env file in root frontend folder
```bash
VITE_API_BASE_URL=http://localhost:5001
```

3. Start Dev server in frontend
```bash
npm run dev
```
</details>



## Features

### Expenses
- [x]  View(All, Single) 
- [x]  Create 
- [x]  Edit 
- [x]  Delete 

### Categories
- [x]  View(All, Single) 
- [x]  Create 
- [x]  Edit 
- [x]  Delete 

### Cron Jobs
- [x]  Daily Cron Job to handle recurring expenses based on recurrence Interval (daily, weekly or monthly)
- [x]  Monthly Cron Job to send message to Rabbit MQ to handle monthly report generation

### Rabbit MQ
- [x]  Handle Messages in Queue
- [x]  Generate CSV report of monthly expenses





## Authors

- [@shehjad-dev](https://github.com/shehjad-dev)