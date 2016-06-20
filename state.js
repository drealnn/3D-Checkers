var gameState = {};
    
    gameState.currentTurn;
    gameState.computerMove;

    gameState.setNextTurn = function()
    {
        if (this.currentTurn == null)
            this.currentTurn = 'player'
        else if (this.currentTurn == 'player')
            this.currentTurn = 'computer';
        else if (this.currentTurn == 'computer')
            this.currentTurn = 'player';
    }
    
    gameState.performComputerTurn = function(squaretomove, computersquare)
    {
        if (this.currentTurn == 'player')
            return;
        
        
        
        if (this.computerMove == -1)
            this.setNextTurn();
        
        console.log("square to move: " + squaretomove + "Square being moved on: " + computersquare);
        
        var selectedComputerObject = squaretiles[squaretomove].piece;
        
        snapSinglePieceOnBoard(selectedComputerObject, computersquare);
        worker.postMessage({'type':'movepiece', 'src': reverseSquare(squaretomove), 'dst': reverseSquare(computersquare)});

        squaretiles[computersquare].piece = squaretiles[squaretomove].piece;
        squaretiles[squaretomove].piece = null;


        for (var j = 0; j < opponentSquares.length; j++)
        {
            if ( computersquare == reverseSquare(opponentSquares[j].move) )
            {
                scene.remove(squaretiles[reverseSquare(opponentSquares[j].position)].piece);
                squaretiles[reverseSquare(opponentSquares[j].position)].piece = null;
                worker.postMessage({'type':'removepiece', 'src': opponentSquares[j].position});
            }
        } // end for

        this.setNextTurn();
        
        
        
        
    }
    
    gameState.init = function()
    {
        var w = window.innerWidth;
		var h = window.innerHeight;
        
        
		
		loadSounds();
		
		scene = new THREE.Scene();
	
		camera = new THREE.PerspectiveCamera( 45, w / h, 0.1, 3000 );
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 300;
		camera.lookAt( scene.position );
		
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0x000000, 1.0 );
		renderer.setSize( w, h );
		renderer.shadowMap.enabled = true;
		
		createCheckerBoard();
		generatePieces();

        // add spotlight for the shadows
        var spotLight = new THREE.SpotLight( 0xffffff );
        spotLight.position.set( 0, 0, 500 );
        spotLight.shadowCameraNear = 20;
        spotLight.shadowCameraFar = 1500;
        spotLight.castShadow = true;
        scene.add(spotLight);
		
		plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(24*8, 24*8, 8, 8), new THREE.MeshBasicMaterial({transparent: true, color: 0x0000ff,opacity: 0.0}));
		plane.position.z = .5;
		plane.name = "Plane";
		scene.add( plane );

		document.body.appendChild( renderer.domElement );		
        
        gameState.setNextTurn();
        

		var blob = new Blob([document.getElementById('worker').textContent]); 
		worker = new Worker( window.URL.createObjectURL( blob ) ); 
		worker.postMessage({'type':'init'});
        
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode("Restart");
        button.appendChild(buttonText);
        
        button.style.position = 'absolute';
        button.tagName = 'button';
        
        button.style.width = 75;
        button.style.height = 30;
        button.style.top = window.innerHeight/2 + 400 + 'px';
        button.style.left = window.innerWidth/2 + 500 + 'px';
        
        var upbutton = createButton('upbutton', '^', 75, 30, -50, 500);
        var downbutton = createButton('downbutton', 'v', 75, 30, 0, 500);
        
        var music = document.createElement("AUDIO");
        music.src = 'sounds/music.mp3';
        
        
        button.addEventListener('click', onButtonClick);
        upbutton.addEventListener('click', onUpButtonClick);
        downbutton.addEventListener('click', onDownButtonClick);
        
        
        music.play();
        music.volume -= .8;
        //renderer.domElement.appendChild(button);
       // document.body.appendChild(music);
        document.body.appendChild(button);
        
    }
    
    gameState.dummy = function()
    {
        return;
    }
    
    gameState.restartGame = function()
    {
        var mybutton = document.getElementsByTagName('button')[0];
        mybutton.disabled = true;
        
        for (var i = 0; i < squaretiles.length; i++)
        {
            if (squaretiles[i].piece != null)
            {
                scene.remove(squaretiles[i].piece);
                squaretiles[i].piece = null
            }
        }
        
        
        moveList = [];
        opponentSquares = [];
        
        generatePieces();
        
        this.currentTurn = 'player';
        
        worker.postMessage({'type':'init'});
        
        mybutton.disabled = false;
        
        
        
    }
    
    function createButton(name, text, width, height, top, left)
    {
        var button = document.createElement("BUTTON");
        var buttonText = document.createTextNode(text);
        button.appendChild(buttonText);
        
        button.style.position = 'absolute';
        button.tagName = name;
        
        button.style.width = width;
        button.style.height = height;
        button.style.top = window.innerHeight/2 + top + 'px';
        button.style.left = window.innerWidth/2 + left + 'px';
        document.body.appendChild(button);
        
        return button;
    }

    function onUpButtonClick()
    {
        camera.position.y += 50;
        camera.lookAt(scene.position);
    }

    function onDownButtonClick()
    {
        camera.position.y -= 50;
        camera.lookAt(scene.position);
    }