# OS-Security-Vulnerabilities-Simulator

## Overview

This educational tool provides hands-on demonstrations of security vulnerabilities that can affect operating systems. Each simulation is interactive and includes visual feedback and logging to help users understand how these vulnerabilities work.

## Features

### 1. Buffer Overflow Simulation
- Demonstrates how exceeding buffer limits can corrupt memory
- Visual representation of memory cells
- Real-time feedback on overflow detection
- Logging of overflow events

### 2. Trapdoor Simulation
- Simulates a login system with a hidden backdoor
- Normal authentication: username="user", password="password"
- Hidden backdoor: username="admin", password="backdoor123"
- Logs all authentication attempts

### 3. Cache Poisoning Simulation
- Shows how cache data can be manipulated
- Demonstrates legitimate vs. poisoned data
- Visual representation of cache contents
- Logging of cache operations

## How to Use

1. Open `index.html` in a modern web browser
2. Each vulnerability has its own section with interactive elements
3. Experiment with different inputs and observe the results
4. Check the logs for detailed information about what's happening

### Buffer Overflow Demo
- Enter text into the input field
- Watch how characters fill the buffer cells
- Notice what happens when you exceed the buffer size

### Trapdoor Demo
- Try logging in with normal credentials
- Attempt incorrect passwords
- Try the backdoor credentials
- Check the logs for access attempts

### Cache Poisoning Demo
- Click "Request Data" to load legitimate data
- Use "Poison Cache" to inject malicious data
- Observe how the cache contents change
- Clear the cache to reset the demonstration

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses LocalStorage to persist logs and simulation data
- No backend required - runs entirely in the browser
- Responsive design works on desktop and mobile devices

## Security Note

This is an educational tool designed to demonstrate security concepts. The simulations are simplified versions of real vulnerabilities and should not be used as reference for actual security implementations.

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Local Storage Usage

The application uses LocalStorage to store:
- Simulation logs
- Backdoor access attempts
- Cache poisoning history

You can clear this data by:
1. Opening your browser's developer tools
2. Going to the Application/Storage tab
3. Clearing the LocalStorage for this domain 
