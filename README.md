# Whatsapp Bot

Automation whatsapp bot using whatsapp-web.js library integrated with artificial intelligence from OpenAI

<p align="center">
  <img src="https://media.giphy.com/media/W012EOmSSCm3m4efco/giphy.gif" />
</p>
<p align="center">
  <img src="https://media.giphy.com/media/2gJq0CsFpXXrua69IR/giphy.gif" />
</p>

## Tech Stack

**Client:** HTML
**Server:** Node, Express
**Library:** Open AI

## Run Locally

Clone the project

```bash
  git clone https://github.com/SQM-Property/wa-automate.git
```

Go to the project directory

```bash
  cd wa-automate
```

Create dotenv file for the environment variables

```bash
  OPENAI_TOKEN=[YOUR_API_TOKEN]
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

## Contributing

welcome to use as needed or develop this project.
sorry if there are many deficiencies or ineffectiveness of the code in this project, please fork and clone this project if you want to try to develop it

Estimated list that I might develop :

- Delete or logout session
- Authentication
- Pop up element to see session card
- Code structure
- client side migration to technologies like React / vue or others

## Thanks to

- Illustration website (Arya Sagitarisandy)
- https://codepen.io/ambiva/pen/bGNWwyg (Card element reference)
- https://codepen.io/visualcookie/details/ZpyaQZ (Input form element reference)
- Open AI (to provide free access services)
- https://www.youtube.com/playlist?list=PLIw7PfYokmfkn2GwHQcfNxZ-s3yk4HopN (Nur Muhammad YT Channer for Whatsapp Web.JS reference)
