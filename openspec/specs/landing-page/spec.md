# landing-page Specification

## Purpose
Define la página de inicio pública de Banco Mi Plata: cómo se presenta la entidad, cómo navega un visitante hacia el inicio de sesión y el registro, y la calidad visual y de accesibilidad mínima que debe cumplir.

## Requirements

### Requirement: Landing page at the root
The web application SHALL serve the institutional landing page at the root address `/` without requiring a session, and the login form SHALL be available at `/login` instead of at the root.

#### Scenario: Visitor opens the root
- **WHEN** a visitor without session opens `/`
- **THEN** the landing page is displayed and no login form is shown on it

#### Scenario: Login at its own address
- **WHEN** a visitor opens `/login`
- **THEN** the login form asking for user name and password is displayed

### Requirement: Public navigation menu
Every public page (landing, login and registration) SHALL show a navigation menu with the bank name linking to the landing page, an "Iniciar sesión" option that goes to `/login` and a "Registrarse" option that goes to `/registro`. The menu SHALL be operable with the keyboard and remain usable on narrow screens without horizontal scrolling.

#### Scenario: Go to login
- **WHEN** a visitor selects "Iniciar sesión" in the menu
- **THEN** the login page is displayed

#### Scenario: Go to registration
- **WHEN** a visitor selects "Registrarse" in the menu
- **THEN** the registration page is displayed

#### Scenario: Back to the landing
- **WHEN** a visitor on the login page selects the bank name or logo in the menu
- **THEN** the landing page is displayed

#### Scenario: Narrow screen
- **WHEN** the landing page is displayed in a 360 pixel wide viewport
- **THEN** both menu options are visible and reachable and the page has no horizontal scroll

### Requirement: Institutional presentation
The landing page SHALL present Banco Mi Plata with a main section containing the bank name, a short value proposition and calls to action for "Registrarse" and "Iniciar sesión", an "about us" section with the mission and values, and a products section describing the savings account, the checking account and the credit card with their key conditions as currently offered by the application.

#### Scenario: Main section
- **WHEN** the landing page is displayed
- **THEN** the main section shows the name "Mi Plata" and links to the registration and login pages

#### Scenario: About section
- **WHEN** the landing page is displayed
- **THEN** a section presents who the bank is, its mission and its values

#### Scenario: Products section
- **WHEN** the landing page is displayed
- **THEN** it describes three products: savings account (1.5% interest on each withdrawal), checking account (overdraft of 20% of the balance, no interests) and credit card (credit limit and monthly interest on the debt)

### Requirement: Visual identity
The landing page SHALL use one consistent visual identity shared with the login and registration pages: a defined color palette for a banking brand, a logo, consistent typography and spacing, and responsive layouts that adapt from mobile to desktop widths. It SHALL NOT depend on external fonts, images or scripts to be displayed correctly.

#### Scenario: Responsive layouts
- **WHEN** the landing page is displayed at 360, 768 and 1280 pixel widths
- **THEN** content is readable at each width, sections reflow without overlapping and there is no horizontal scroll

#### Scenario: No external resources
- **WHEN** the landing page loads
- **THEN** every font, image and script it needs is served by the application itself

### Requirement: Corporate footer
Every public page SHALL end with a footer showing the corporate information (company name, tax or registration identifier, address, phone, email, service hours) and links to the bank's social networks (Facebook, Instagram, X and LinkedIn) plus a copyright notice with the current year. Social links SHALL open in a new tab without giving the destination access to the opener and SHALL have accessible names.

#### Scenario: Corporate data
- **WHEN** the landing page is displayed
- **THEN** the footer shows company name, identifier, address, phone, email and service hours

#### Scenario: Social links
- **WHEN** a visitor looks at the footer
- **THEN** there are four links, one per social network, each with an accessible name and opening in a new tab with no opener access

### Requirement: Basic accessibility
Public pages SHALL use semantic landmarks (header with navigation, main content and footer), a single main heading, a visible keyboard focus indicator, text with sufficient contrast against its background, and a way to skip directly to the main content.

#### Scenario: Landmarks and heading
- **WHEN** a public page is displayed
- **THEN** it contains one header with navigation, one main region, one footer and exactly one level-one heading

#### Scenario: Skip link
- **WHEN** a keyboard user presses Tab on a public page
- **THEN** the first focusable element is a link that moves focus to the main content
