// Theme Switching
document.getElementById('theme-switch').addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Tab Navigation
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all sections and buttons
        document.querySelectorAll('.vulnerability-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        const sectionId = button.dataset.section;
        document.getElementById(sectionId).classList.add('active');
    });
});

// Utility function to add log messages with animations
function addLog(logId, message, isError = false) {
    const log = document.getElementById(logId);
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logEntry.style.color = isError ? '#ef4444' : '#e0e7ff';
    logEntry.style.opacity = '0';
    logEntry.style.transform = 'translateX(-10px)';
    logEntry.style.transition = 'all 0.3s ease-out';
    log.insertBefore(logEntry, log.firstChild);
    
    // Trigger animation
    setTimeout(() => {
        logEntry.style.opacity = '1';
        logEntry.style.transform = 'translateX(0)';
    }, 50);
    
    // Store in localStorage
    const logs = JSON.parse(localStorage.getItem(`${logId}-history`) || '[]');
    logs.unshift({ timestamp: new Date().toISOString(), message, isError });
    localStorage.setItem(`${logId}-history`, JSON.stringify(logs.slice(0, 50)));
}

// Buffer Overflow Simulation
document.addEventListener('DOMContentLoaded', () => {
    const bufferInput = document.getElementById('buffer-input');
    const bufferCells = document.querySelector('.buffer-cells');
    const bufferSize = document.getElementById('buffer-size');
    const bufferSizeDisplay = document.getElementById('buffer-size-display');
    const charCounter = document.querySelector('.char-counter');
    let BUFFER_SIZE = 8;
    let overflowCount = 0;
    let corruptionCount = 0;
    let lastInputLength = 0;  // Track previous input length
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = '🔄 Reset Simulation';
    resetButton.className = 'action-btn';
    resetButton.style.marginLeft = '10px';
    document.querySelector('.control-panel').appendChild(resetButton);
    
    function updateBufferSize(size) {
        BUFFER_SIZE = size;
        bufferSizeDisplay.textContent = size;
        charCounter.textContent = `0/${size} characters`;
        
        // Update buffer cells with labels
        bufferCells.innerHTML = '';
        for (let i = 0; i < size + 4; i++) {
            const cell = document.createElement('div');
            cell.className = 'buffer-cell';
            cell.dataset.index = i;
            
            // Add memory address label
            const label = document.createElement('div');
            label.className = 'memory-address';
            label.textContent = `0x${(i * 4).toString(16).padStart(3, '0')}`;
            cell.appendChild(label);
            
            bufferCells.appendChild(cell);
        }

        // Update the tooltip with new buffer size
        document.querySelector('.buffer-tooltip').innerHTML = `
            <h4>How to Test Buffer Overflow:</h4>
            <ol>
                <li>Type more than ${size} characters</li>
                <li>Watch for red cells (memory corruption)</li>
                <li>Check the overflow and corruption counters</li>
                <li>Adjust buffer size using the slider</li>
            </ol>
        `;
    }
    
    function resetSimulation() {
        bufferInput.value = '';
        overflowCount = 0;
        corruptionCount = 0;
        lastInputLength = 0;
        document.getElementById('overflow-count').textContent = '0';
        document.getElementById('corruption-count').textContent = '0';
        updateBufferSize(BUFFER_SIZE);
        addLog('buffer-log', 'Simulation reset. Buffer cleared.', false);
    }
    
    resetButton.addEventListener('click', resetSimulation);
    
    bufferSize.addEventListener('input', (e) => {
        updateBufferSize(parseInt(e.target.value));
        bufferInput.value = '';
        lastInputLength = 0;
    });
    
    bufferInput.addEventListener('input', (e) => {
        const input = e.target.value;
        const cells = document.querySelectorAll('.buffer-cell');
        charCounter.textContent = `${input.length}/${BUFFER_SIZE} characters`;
        
        // Update character counter color based on usage
        if (input.length > BUFFER_SIZE) {
            charCounter.style.color = '#ef4444';
        } else if (input.length > BUFFER_SIZE * 0.8) {
            charCounter.style.color = '#f59e0b';
        } else {
            charCounter.style.color = '#64748b';
        }
        
        cells.forEach((cell, index) => {
            const char = input[index] || '';
            cell.textContent = char;  // Set the character
            
            // Re-add the memory address label
            const label = document.createElement('div');
            label.className = 'memory-address';
            label.textContent = `0x${(index * 4).toString(16).padStart(3, '0')}`;
            cell.appendChild(label);
            
            cell.className = 'buffer-cell';
            
            if (index >= BUFFER_SIZE && char) {
                cell.classList.add('overflow');
                if (!cell.dataset.corrupted) {
                    cell.dataset.corrupted = 'true';
                    corruptionCount++;
                    document.getElementById('corruption-count').textContent = corruptionCount;
                    
                    // Add visual effect for corruption
                    cell.style.animation = 'none';
                    cell.offsetHeight; // Trigger reflow
                    cell.style.animation = 'shake 0.5s';
                    
                    addLog('buffer-log', `Buffer overflow detected! Memory at 0x${(index * 4).toString(16).padStart(3, '0')} corrupted.`, true);
                }
            }
        });
        
        // Check for new overflow attempt
        if (input.length > BUFFER_SIZE) {
            // Only count as new overflow if we weren't already in overflow state
            if (lastInputLength <= BUFFER_SIZE) {
                overflowCount++;
                document.getElementById('overflow-count').textContent = overflowCount;
                
                // Add detailed overflow message
                addLog('buffer-log', 
                    `Warning: Buffer overflow detected!\n` +
                    `Buffer size: ${BUFFER_SIZE} characters\n` +
                    `Input length: ${input.length} characters\n` +
                    `Overflow size: ${input.length - BUFFER_SIZE} characters`, true);
                
                // Visual feedback
                bufferInput.style.animation = 'none';
                bufferInput.offsetHeight; // Trigger reflow
                bufferInput.style.animation = 'shake 0.5s';
            }
        }
        
        // Update last input length
        lastInputLength = input.length;
    });
    
    // Add helpful tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'buffer-tooltip';
    tooltip.innerHTML = `
        <h4>How to Test Buffer Overflow:</h4>
        <ol>
            <li>Type more than ${BUFFER_SIZE} characters</li>
            <li>Watch for red cells (memory corruption)</li>
            <li>Check the overflow and corruption counters</li>
            <li>Adjust buffer size using the slider</li>
        </ol>
    `;
    document.querySelector('.memory-visualization').prepend(tooltip);
    
    // Initialize buffer
    updateBufferSize(BUFFER_SIZE);
});

// Trapdoor Simulation
(() => {
    const loginForm = document.getElementById('login-form');
    const serverStatus = document.getElementById('server-status');
    const statusDot = document.querySelector('.status-dot');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    let loginAttempts = 0;
    
    const BACKDOOR = {
        username: 'admin',
        password: 'backdoor123'
    };
    
    function updateServerStatus(status) {
        serverStatus.textContent = status;
        statusDot.style.background = status === 'Online' ? '#10b981' : '#ef4444';
    }
    
    // Simulate server load
    setInterval(() => {
        if (Math.random() < 0.1) {
            updateServerStatus('Busy');
            setTimeout(() => updateServerStatus('Online'), 2000);
        }
    }, 5000);
    
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        loginAttempts++;
        
        // Simulate server processing
        updateServerStatus('Processing');
        
        setTimeout(() => {
            // Simulate normal authentication
            if (username === 'user' && password === 'password') {
                addLog('trapdoor-log', 'Login successful through normal authentication.');
                updateServerStatus('Online');
                return;
            }
            
            // Check for backdoor
            if (username === BACKDOOR.username && password === BACKDOOR.password) {
                addLog('trapdoor-log', 'WARNING: System accessed through backdoor!', true);
                // Store backdoor access in localStorage
                const backdoorAccesses = JSON.parse(localStorage.getItem('backdoor-accesses') || '[]');
                backdoorAccesses.push(new Date().toISOString());
                localStorage.setItem('backdoor-accesses', JSON.stringify(backdoorAccesses));
            } else {
                addLog('trapdoor-log', `Login failed: Invalid credentials (Attempt ${loginAttempts})`);
                if (loginAttempts >= 3) {
                    addLog('trapdoor-log', 'Multiple failed attempts detected. Hint: Try finding the backdoor...', true);
                }
            }
            updateServerStatus('Online');
        }, 1000);
    });
})();

// Cache Poisoning Simulation
(() => {
    const cache = new Map();
    
    // Legitimate Data with TTL (Time To Live)
    const LEGITIMATE_DATA = {
        'dns.cache': {
            'example.com': { ip: '93.184.216.34', ttl: 3600 },
            'google.com': { ip: '142.251.16.100', ttl: 3600 },
            'github.com': { ip: '140.82.121.4', ttl: 3600 }
        },
        'user.data': {
            name: 'John Doe',
            balance: 1000,
            email: 'john@example.com',
            lastLogin: '2024-03-20T10:00:00Z',
            permissions: ['read', 'write']
        },
        'config.sys': {
            theme: 'light',
            language: 'en',
            security: {
                level: 'high',
                twoFactor: true,
                lastUpdate: '2024-03-20'
            }
        },
        'api.endpoints': {
            'payment': 'https://api.payment.com/v1',
            'auth': 'https://api.auth.com/v2',
            'data': 'https://api.data.com/v1'
        }
    };

    // Poisoned Data Variants
    const POISONED_DATA = {
        'dns.cache': {
            'example.com': { ip: '31.33.7.1', ttl: 86400, poisoned: true }, // Malicious IP
            'google.com': { ip: '185.32.100.1', ttl: 86400, poisoned: true },
            'github.com': { ip: '103.21.244.12', ttl: 86400, poisoned: true }
        },
        'user.data': {
            name: 'John Doe',
            balance: 999999,
            email: 'john@evil.com', // Changed email
            lastLogin: '2024-03-20T10:00:00Z',
            permissions: ['read', 'write', 'admin', 'sudo'], // Escalated privileges
            maliciousScript: 'javascript:void(0)'
        },
        'config.sys': {
            theme: 'light',
            language: 'en',
            security: {
                level: 'none', // Disabled security
                twoFactor: false,
                lastUpdate: '2024-03-20'
            },
            malware: true,
            backdoor: '/dev/tcp/evil.com/443'
        },
        'api.endpoints': {
            'payment': 'https://evil.payment.com/v1', // Redirected endpoints
            'auth': 'https://evil.auth.com/v2',
            'data': 'https://evil.data.com/v1'
        }
    };

    // Cache entry class with TTL and validation
    class CacheEntry {
        constructor(key, data, ttl = 3600) {
            this.key = key;
            this.data = data;
            this.created = Date.now();
            this.ttl = ttl;
            this.poisoned = data.poisoned || false;
            this.accessed = 0;
            this.hits = 0;
        }

        isExpired() {
            return Date.now() - this.created > this.ttl * 1000;
        }

        access() {
            this.accessed = Date.now();
            this.hits++;
        }

        getAge() {
            return Math.round((Date.now() - this.created) / 1000);
        }
    }

    function updateStats() {
        const stats = {
            total: cache.size,
            poisoned: 0,
            expired: 0,
            healthy: 0
        };

        cache.forEach(entry => {
            if (entry.poisoned) stats.poisoned++;
            if (entry.isExpired()) stats.expired++;
            if (!entry.poisoned && !entry.isExpired()) stats.healthy++;
        });

        document.getElementById('cache-size').textContent = stats.total;
        document.getElementById('poison-count').textContent = stats.poisoned;
        
        // Add new statistics display
        const statsContainer = document.querySelector('.cache-stats');
        statsContainer.innerHTML = `
            <div>Cache Entries: <span class="stat-value">${stats.total}</span></div>
            <div>Poisoned: <span class="stat-value ${stats.poisoned > 0 ? 'danger' : ''}">${stats.poisoned}</span></div>
            <div>Expired: <span class="stat-value warning">${stats.expired}</span></div>
            <div>Healthy: <span class="stat-value success">${stats.healthy}</span></div>
        `;
    }

    function updateCacheDisplay() {
        const container = document.querySelector('.cache-container');
        container.innerHTML = '';

        cache.forEach((entry, key) => {
            const item = document.createElement('div');
            item.className = 'cache-item';
            if (entry.poisoned) item.classList.add('poisoned');
            if (entry.isExpired()) item.classList.add('expired');

            const age = entry.getAge();
            const timeLeft = Math.max(0, Math.round(entry.ttl - age));

            item.innerHTML = `
                <div class="cache-item-header">
                    <strong>${key}</strong>
                    <span class="cache-item-status">
                        ${entry.poisoned ? '☠️ Poisoned' : '✅ Clean'}
                    </span>
                </div>
                <div class="cache-item-meta">
                    <span>Age: ${age}s</span>
                    <span>TTL: ${timeLeft}s</span>
                    <span>Hits: ${entry.hits}</span>
                </div>
                <div class="cache-item-data">
                    <small>${JSON.stringify(entry.data).slice(0, 50)}...</small>
                </div>
                <div class="cache-item-progress">
                    <div class="ttl-bar" style="width: ${(timeLeft / entry.ttl) * 100}%"></div>
                </div>
            `;

            // Detailed view on hover
            const detailView = document.createElement('div');
            detailView.className = 'cache-item-detail';
            detailView.innerHTML = `
                <h4>Cache Entry Details</h4>
                <pre>${JSON.stringify(entry.data, null, 2)}</pre>
                <div class="cache-item-stats">
                    <div>Created: ${new Date(entry.created).toLocaleTimeString()}</div>
                    <div>Last Accessed: ${new Date(entry.accessed).toLocaleTimeString()}</div>
                    <div>Access Count: ${entry.hits}</div>
                </div>
            `;
            item.appendChild(detailView);

            container.appendChild(item);
        });
        
        updateStats();
    }

    // Auto-update display and expire entries
    setInterval(() => {
        let updated = false;
        cache.forEach((entry, key) => {
            if (entry.isExpired()) {
                cache.delete(key);
                updated = true;
                addLog('cache-log', `Cache entry expired and removed: ${key}`);
            }
        });
        if (updated) {
            updateCacheDisplay();
        }
    }, 1000);

    document.getElementById('request-data').addEventListener('click', () => {
        const categories = Object.keys(LEGITIMATE_DATA);
        const randomKey = categories[Math.floor(Math.random() * categories.length)];
        const data = LEGITIMATE_DATA[randomKey];
        const ttl = randomKey === 'dns.cache' ? 3600 : 7200;

        const entry = new CacheEntry(randomKey, data, ttl);
        cache.set(randomKey, entry);
        
        addLog('cache-log', `Cached legitimate data for: ${randomKey} (TTL: ${ttl}s)`);
        updateCacheDisplay();
    });

    document.getElementById('poison-cache').addEventListener('click', () => {
        const categories = Object.keys(POISONED_DATA);
        const randomKey = categories[Math.floor(Math.random() * categories.length)];
        const data = POISONED_DATA[randomKey];
        
        // Poisoned entries get longer TTL to persist
        const entry = new CacheEntry(randomKey, data, 86400);
        entry.poisoned = true;
        cache.set(randomKey, entry);

        addLog('cache-log', `WARNING: Cache poisoned for: ${randomKey}! Malicious data injected.`, true);
        updateCacheDisplay();

        // Store poisoning attempt in localStorage
        const poisoningAttempts = JSON.parse(localStorage.getItem('cache-poisoning-attempts') || '[]');
        poisoningAttempts.push({
            timestamp: new Date().toISOString(),
            key: randomKey,
            data: data
        });
        localStorage.setItem('cache-poisoning-attempts', JSON.stringify(poisoningAttempts));
    });

    document.getElementById('clear-cache').addEventListener('click', () => {
        cache.clear();
        addLog('cache-log', 'Cache cleared');
        updateCacheDisplay();
    });

    // Add new buttons for specific attacks
    const attacksContainer = document.createElement('div');
    attacksContainer.className = 'attack-scenarios';
    attacksContainer.innerHTML = `
        <h4>Common Attack Scenarios</h4>
        <button class="attack-btn" data-attack="dns">DNS Poisoning</button>
        <button class="attack-btn" data-attack="privilege">Privilege Escalation</button>
        <button class="attack-btn" data-attack="api">API Endpoint Hijacking</button>
    `;
    
    document.querySelector('.cache-controls').after(attacksContainer);

    // Handle specific attack scenarios
    document.querySelectorAll('.attack-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const attackType = btn.dataset.attack;
            let entry;

            switch(attackType) {
                case 'dns':
                    entry = new CacheEntry('dns.cache', POISONED_DATA['dns.cache'], 86400);
                    addLog('cache-log', 'WARNING: DNS cache poisoned! Traffic may be redirected to malicious servers.', true);
                    break;
                case 'privilege':
                    entry = new CacheEntry('user.data', POISONED_DATA['user.data'], 86400);
                    addLog('cache-log', 'WARNING: User permissions cache poisoned! Unauthorized privilege escalation detected.', true);
                    break;
                case 'api':
                    entry = new CacheEntry('api.endpoints', POISONED_DATA['api.endpoints'], 86400);
                    addLog('cache-log', 'WARNING: API endpoints cache poisoned! Requests may be redirected to malicious servers.', true);
                    break;
            }

            if (entry) {
                entry.poisoned = true;
                cache.set(entry.key, entry);
                updateCacheDisplay();
            }
        });
    });
})(); 
