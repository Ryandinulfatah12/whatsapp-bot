# Whatsapp Bot

Automation whatsapp bot using whatsapp-web.js library

## Tech Stack

**Client:** HTML

**Server:** Node, Express

## Run Locally

Clone the project

```bash
  git clone https://github.com/SQM-Property/wa-automate.git
```

Go to the project directory

```bash
  cd wa-automate
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

or

```bash
  node index.js
```

then open browser and run localhost:8080

```bash
  http://localhost:8080/
```

## API Reference

#### Test sending message by ID

you have to add id manually in client and link your whatsapp device to client.

```http
  POST /send-message
```

# x-www-form-urlencoded body

Example

| params    | value               |
| :-------- | :------------------ |
| `number`  | `0888xxxxxxx`       |
| `message` | `[bot] hello world` |
| `sender`  | `12`                |

## Authors

- Ryan Dinul Fatah
