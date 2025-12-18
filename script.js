// Trait data with local assets
var traitData = {
    mask: [
        "assets/mouth assets/1.png",
        "assets/mouth assets/2.png",
        "assets/mouth assets/3.png",
        "assets/mouth assets/4.png",
        "assets/mouth assets/5.png"
    ],
    necklace: [
        "assets/top assets/1.png",  // These are actually necklaces
        "assets/top assets/2.png",
        "assets/top assets/3.png",
        "assets/top assets/4.png",
        "assets/top assets/5.png"
    ],
    clothes: [
        "assets/glasses assets/1.png",  // These are actually clothes
        "assets/glasses assets/2.png",
        "assets/glasses assets/3.png",
        "assets/glasses assets/4.png",
        "assets/glasses assets/5.png"
    ],
    base: ["assets/11.png"],
    background: [
        "assets/background/1.png",
        "assets/background/2.png",
        "assets/background/3.png",
        "assets/background/4.png",
        "assets/background/5.png",
        "assets/background/6.png",
        "assets/background/7.png",
        "assets/background/8.png",
        "assets/background/9.png",
        "assets/background/10.png",
        "assets/background/11.png",
        "assets/background/12.png"
    ]
};

// Layer order from TOP to BOTTOM (as specified)
var layerOrder = ['mask', 'necklace', 'clothes', 'base', 'background'];

var selectedTraits = {
    mask: null,
    necklace: null,
    clothes: null,
    base: "assets/11.png",
    background: null
};

var canvas = document.getElementById("pfpCanvas");
var ctx = canvas.getContext("2d");

// Track loaded images
var loadedImages = {};

function generateRandomId() {
    return Math.floor(10000 + Math.random() * 90000);
}

function updateCurrentSelection() {
    var selectionDiv = document.getElementById('currentSelection');
    var html = '';
    
    for (var i = 0; i < layerOrder.length; i++) {
        var layer = layerOrder[i];
        var src = selectedTraits[layer];
        
        if (src) {
            var traitName = 'None';
            
            if (typeof src === "object" && src.gradient) {
                traitName = src.name || "Gradient";
            } else if (typeof src === "string") {
                var filename = src.split('/').pop().replace('.png', '');
                traitName = filename.replace(/\b\w/g, function(l) { return l.toUpperCase(); })
                                    .replace(/assets/g, '')
                                    .replace(/background/g, 'BG')
                                    .replace(/glasses/g, 'Clothes')
                                    .replace(/mouth/g, 'Mask')
                                    .replace(/top/g, 'Necklace')
                                    .replace(/assets/g, '')
                                    .replace(/\s+/g, ' ')
                                    .trim();
                
                if (traitName === '11') {
                    traitName = "Base Character";
                }
            }
            
            html += '<div><span class="post-number">>></span> ' + layer + ': <strong>' + traitName + '</strong></div>';
        }
    }
    
    selectionDiv.innerHTML = html || '<span class="post-number">>></span> None selected';
}

// Load an image
function loadImage(src, callback) {
    if (loadedImages[src] && loadedImages[src].complete) {
        callback(loadedImages[src]);
        return;
    }
    
    var img = new Image();
    img.onload = function() {
        loadedImages[src] = img;
        callback(img);
    };
    img.onerror = function() {
        console.error("Failed to load image:", src);
        callback(null);
    };
    img.src = src;
}

function renderCanvas() {
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // IMPORTANT: We need to draw from BOTTOM to TOP
    // So we reverse the layerOrder array for drawing
    var drawOrder = layerOrder.slice().reverse();
    
    // First, draw gradients (these are immediate)
    for (var i = 0; i < drawOrder.length; i++) {
        var layer = drawOrder[i];
        var src = selectedTraits[layer];
        
        if (src && typeof src === "object" && src.gradient) {
            var grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, src.gradient[0]);
            grad.addColorStop(1, src.gradient[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Now load and draw images in order (from bottom to top)
    var imagesToLoad = [];
    for (var i = 0; i < drawOrder.length; i++) {
        var layer = drawOrder[i];
        var src = selectedTraits[layer];
        
        if (src && typeof src === "string") {
            imagesToLoad.push({src: src, layer: layer, index: i});
        }
    }
    
    if (imagesToLoad.length === 0) {
        updateCurrentSelection();
        return;
    }
    
    // Function to draw images in correct order (bottom to top)
    function drawNextImage(currentIndex) {
        if (currentIndex >= imagesToLoad.length) {
            updateCurrentSelection();
            return;
        }
        
        var imageInfo = imagesToLoad[currentIndex];
        
        loadImage(imageInfo.src, function(img) {
            if (img) {
                // Draw this image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            // Draw next image
            drawNextImage(currentIndex + 1);
        });
    }
    
    // Start drawing from first image (which will be background since we reversed)
    drawNextImage(0);
}

function selectTab(tabName) {
    var buttons = document.querySelectorAll('.trait-tabs button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    var selectedButton = document.getElementById(tabName + '-btn');
    if (selectedButton) selectedButton.classList.add('active');

    var container = document.getElementById("traits-container");
    container.innerHTML = "";

    if (!traitData[tabName]) return;

    // Add "None" option
    var noneOption = document.createElement("div");
    noneOption.className = "gradient-preview";
    noneOption.textContent = "None";
    noneOption.style.background = "#EA8";
    noneOption.style.color = "#000";
    if (!selectedTraits[tabName]) {
        noneOption.classList.add("selected");
    }
    noneOption.addEventListener("click", function() {
        selectedTraits[tabName] = null;
        selectTab(tabName);
        renderCanvas();
    });
    container.appendChild(noneOption);

    for (var i = 0; i < traitData[tabName].length; i++) {
        var src = traitData[tabName][i];
        var element;
        
        if (typeof src === "object" && src.gradient) {
            element = document.createElement("div");
            element.className = "gradient-preview";
            element.style.background = 'linear-gradient(135deg, ' + src.gradient[0] + ', ' + src.gradient[1] + ')';
            element.textContent = src.name || "Gradient";
            
            if (JSON.stringify(selectedTraits[tabName]) === JSON.stringify(src)) {
                element.classList.add("selected");
            }
        } else {
            element = document.createElement("img");
            element.src = src;
            element.alt = src.split('/').pop().replace('.png', '');
            
            if (selectedTraits[tabName] === src) {
                element.classList.add("selected");
            }
            
            element.onerror = function() {
                this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23EA8'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='10' text-anchor='middle' dy='.3em' fill='black'%3EImage%3C/text%3E%3C/svg%3E";
            };
        }

        element.addEventListener("click", (function(currentSrc) {
            return function() {
                if (JSON.stringify(selectedTraits[tabName]) === JSON.stringify(currentSrc) || selectedTraits[tabName] === currentSrc) {
                    selectedTraits[tabName] = null;
                } else {
                    selectedTraits[tabName] = currentSrc;
                }
                selectTab(tabName);
                renderCanvas();
            };
        })(src));

        container.appendChild(element);
    }
}

function downloadImage() {
    // Create a temporary canvas for download
    var tempCanvas = document.createElement('canvas');
    var tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    
    // Draw order from BOTTOM to TOP
    var drawOrder = layerOrder.slice().reverse();
    var imagesToLoad = [];
    
    // Draw gradients first
    for (var i = 0; i < drawOrder.length; i++) {
        var layer = drawOrder[i];
        var src = selectedTraits[layer];
        if (src && typeof src === "object" && src.gradient) {
            var grad = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
            grad.addColorStop(0, src.gradient[0]);
            grad.addColorStop(1, src.gradient[1]);
            tempCtx.fillStyle = grad;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
    }
    
    // Collect images to load
    for (var i = 0; i < drawOrder.length; i++) {
        var layer = drawOrder[i];
        var src = selectedTraits[layer];
        if (src && typeof src === "string") {
            imagesToLoad.push(src);
        }
    }
    
    if (imagesToLoad.length === 0) {
        var link = document.createElement("a");
        link.download = 'anon_' + generateRandomId() + '.png';
        link.href = tempCanvas.toDataURL("image/png", 1.0);
        link.click();
        document.getElementById('randomId').textContent = generateRandomId();
        return;
    }
    
    // Load and draw images in correct order (bottom to top)
    function drawNextDownloadImage(index) {
        if (index >= imagesToLoad.length) {
            var link = document.createElement("a");
            link.download = 'anon_' + generateRandomId() + '.png';
            link.href = tempCanvas.toDataURL("image/png", 1.0);
            link.click();
            document.getElementById('randomId').textContent = generateRandomId();
            return;
        }
        
        loadImage(imagesToLoad[index], function(img) {
            if (img) {
                tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            }
            drawNextDownloadImage(index + 1);
        });
    }
    
    drawNextDownloadImage(0);
}

function shuffleTraits() {
    for (var trait in traitData) {
        if (traitData[trait].length > 0) {
            var randomIndex = Math.floor(Math.random() * traitData[trait].length);
            selectedTraits[trait] = traitData[trait][randomIndex];
        }
    }
    
    var activeBtn = document.querySelector('.trait-tabs .active');
    if (activeBtn) {
        var tabName = activeBtn.id.replace('-btn', '');
        selectTab(tabName);
    } else {
        selectTab("mask");
    }
    
    renderCanvas();
    alert("Traits shuffled. Enjoy your new anonymous persona.");
}

function removeAllTraits() {
    if (!confirm("Clear all traits?")) return;
    
    // Clear current selections
    selectedTraits = {
        mask: null,
        necklace: null,
        clothes: null,
        base: "assets/11.png",
        background: null
    };
    
    // ALSO clear the saved preset from localStorage
    localStorage.removeItem('anonymous_preset');
    
    var activeBtn = document.querySelector('.trait-tabs .active');
    if (activeBtn) {
        var tabName = activeBtn.id.replace('-btn', '');
        selectTab(tabName);
    }
    renderCanvas();
    
    alert("All traits cleared and preset removed.");
}

function savePreset() {
    var preset = JSON.stringify(selectedTraits);
    localStorage.setItem('anonymous_preset', preset);
    alert("Preset saved to browser storage.");
}

function shareToClipboard() {
    // Create a modal for sharing options
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    var modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #F0E0D6;
        border: 2px solid #800000;
        padding: 20px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    var dataUrl = canvas.toDataURL('image/png');
    
    modalContent.innerHTML = `
        <div class="panel-title" style="margin: -20px -20px 20px -20px; padding: 10px 20px;">Share Image</div>
        <p><span class="greentext">>Choose a sharing method:</span></p>
        
        <div style="display: flex; flex-direction: column; gap: 10px; margin: 15px 0;">
            <button id="copyUrlBtn" style="background: #EA8; border: 1px solid #B7C5D9; padding: 10px; cursor: pointer;">
                📋 Copy Image URL to Clipboard
            </button>
            
            <button id="downloadUrlBtn" style="background: #EA8; border: 1px solid #B7C5D9; padding: 10px; cursor: pointer;">
                ⬇ Download as Text File
            </button>
            
            <button id="shareTwitterBtn" style="background: #EA8; border: 1px solid #B7C5D9; padding: 10px; cursor: pointer;">
                🐦 Share on Twitter (Download First)
            </button>
            
            <button id="closeModalBtn" style="background: #800000; color: white; border: 1px solid #660000; padding: 10px; cursor: pointer; margin-top: 10px;">
                ✖ Close
            </button>
        </div>
        
        <div style="background: white; padding: 10px; border: 1px solid #B7C5D9; margin-top: 15px; font-size: 11px;">
            <p><strong>Note:</strong> Image data URLs can be very long (${Math.round(dataUrl.length/1000)}KB).</p>
            <p>For sharing online, download the image and upload to imgur/discord/etc.</p>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners for modal buttons
    document.getElementById('copyUrlBtn').addEventListener('click', function() {
        var tempInput = document.createElement('input');
        tempInput.value = dataUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(dataUrl).then(function() {
                    alert("✓ URL copied to clipboard!");
                }).catch(function() {
                    document.execCommand('copy');
                    alert("✓ URL copied to clipboard!");
                });
            } else {
                document.execCommand('copy');
                alert("✓ URL copied to clipboard!");
            }
        } catch (err) {
            alert("Copy failed. Try downloading instead.");
        }
        document.body.removeChild(tempInput);
    });
    
    document.getElementById('downloadUrlBtn').addEventListener('click', function() {
        var link = document.createElement("a");
        link.download = 'anonymous_pfp_data_url.txt';
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataUrl);
        link.click();
        alert("Data URL downloaded as text file.");
    });
    
    document.getElementById('shareTwitterBtn').addEventListener('click', function() {
        // First download the image
        var link = document.createElement("a");
        link.download = 'anonymous_pfp_' + generateRandomId() + '.png';
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
        
        // Then open Twitter
        setTimeout(function() {
            var tweetText = encodeURIComponent("Check out my anonymous PFP generated with 4chan-style PFP Generator!");
            var twitterUrl = 'https://twitter.com/intent/tweet?text=' + tweetText;
            window.open(twitterUrl, '_blank');
        }, 500);
    });
    
    document.getElementById('closeModalBtn').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function printCanvas() {
    var printWindow = window.open('', '_blank');
    var dataUrl = canvas.toDataURL('image/png');
    var htmlContent = '<html><head><title>$Anon PFP Print</title><style>body { text-align: center; padding: 20px; } img { max-width: 100%; height: auto; }</style></head><body><h2>$Anon PFP</h2><img src="' + dataUrl + '" /><p>Generated on ' + new Date().toLocaleString() + '</p><script>window.onload = function() { window.print(); }<\/script></body></html>';
    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

function initEventListeners() {
    // Update tab buttons to match new layer names
    document.getElementById('background-btn').addEventListener('click', function() { 
        selectTab('background'); 
    });
    document.getElementById('clothes-btn').addEventListener('click', function() { 
        selectTab('clothes'); 
    });
    document.getElementById('mask-btn').addEventListener('click', function() { 
        selectTab('mask'); 
    });
    document.getElementById('necklace-btn').addEventListener('click', function() { 
        selectTab('necklace'); 
    });
    document.getElementById('base-btn').addEventListener('click', function() { 
        selectTab('base'); 
    });
    
    document.getElementById('download').addEventListener('click', downloadImage);
    document.getElementById('visit4chan').addEventListener('click', function() { 
        window.open('https://boards.4chan.org/a/', '_blank'); 
    });
    document.getElementById('shuffle').addEventListener('click', shuffleTraits);
    document.getElementById('removeAll').addEventListener('click', removeAllTraits);
    document.getElementById('savePreset').addEventListener('click', savePreset);
    document.getElementById('copyUrl').addEventListener('click', shareToClipboard);
    document.getElementById('printPreview').addEventListener('click', printCanvas);
}

document.addEventListener("DOMContentLoaded", function() {
    // Update tab labels to match new layer names
    document.getElementById('background-btn').textContent = 'BACKGROUND';
    document.getElementById('clothes-btn').textContent = 'CLOTHES';
    document.getElementById('mask-btn').textContent = 'MASK';
    document.getElementById('necklace-btn').textContent = 'NECKLACE';
    document.getElementById('base-btn').textContent = 'BASE';
    
    document.getElementById('randomId').textContent = generateRandomId();
    
    var savedPreset = localStorage.getItem('anonymous_preset');
    if (savedPreset) {
        try {
            var parsed = JSON.parse(savedPreset);
            for (var key in parsed) {
                if (parsed[key]) selectedTraits[key] = parsed[key];
            }
        } catch (e) {
            console.error("Failed to load preset:", e);
        }
    }
    
    initEventListeners();
    
    selectTab("mask"); // Start with mask tab
    renderCanvas();
    
    console.log("%c╔══════════════════════════════════════╗", "color: #800000");
    console.log("%c║  Anon PFP Generator v1.0       ║", "color: #800000");
    console.log("%c║  Welcome, anon.                     ║", "color: #800000");
    console.log("%c╚══════════════════════════════════════╝", "color: #800000");
});