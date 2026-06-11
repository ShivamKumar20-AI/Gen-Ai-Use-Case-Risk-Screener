<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ae00b723-dde2-439f-bc53-2aabcfb1911b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   # Gen AI Use Case Risk Screener

A lightweight tool that helps organisations quickly screen new GenAI use cases for risk, mapping them to common governance and control requirements (e.g. ISO 27001 and NIST).[web:21][web:24]

## Overview

This project provides a structured questionnaire and scoring model to identify governance, security, privacy and compliance risks early in the GenAI use case lifecycle.[web:21] It is designed to support GRC teams, security engineers and product owners when assessing new AI features.[web:24]

## Features

- Interactive risk screening flow for GenAI use cases.
- Categorisation of risks across security, privacy, ethics and compliance.
- Simple scoring or traffic‑light style output to support decision making.
- Designed to integrate with existing GRC workflows and registers.[web:24]

## Tech stack

- Google AI Studio (Gemini) app for the conversational screener UI.
- Markdown/CSV based prompts or configuration for questions and scoring (if applicable).
- GitHub for version control and collaboration.[web:21]

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/ShivamKumar20-AI/Gen-Ai-Use-Case-Risk-Screener.git
   cd Gen-Ai-Use-Case-Risk-Screener
   ```

2. Open the project in your editor (for example, VS Code) and review the main configuration or prompt files used by the AI Studio app.[web:19]

3. Follow the instructions in the **Deployment** section below to connect the repo contents with your Google AI Studio project.[web:21]

## Usage

- Open the GenAI Use Case Risk Screener in Google AI Studio.
- Provide a short description of the proposed use case (system, data, users, and business process).
- Answer the follow‑up questions about data sensitivity, model behaviour, access control and oversight.
- Review the generated risk summary and recommended controls.\[1][web:21]

You can export the output and attach it to your risk register, change ticket, or design documentation.\[1][web:21]

## Deployment / Integration

- Link this repository to your Google AI Studio project configuration, prompts or backend logic.
- When you update prompt logic or scoring rules here, redeploy or re‑import them into AI Studio so the app uses the latest version.[web:21][web:25]

(Adapt this section once you’ve formalised exactly how the repo connects to the AI Studio app.)

## Roadmap

- Add more detailed mappings to ISO 27001:2022 controls and NIST CSF categories.
- Include example risk reports and decision records.
- Add automated tests for the scoring logic.[web:21][web:24]

## Contributing

Contributions, issues and feature requests are welcome. Feel free to open an issue or submit a pull request describing your changes.[web:21][web:24]

## License

Specify your chosen license here (for example, MIT) and add a corresponding `LICENSE` file.[web:21]
