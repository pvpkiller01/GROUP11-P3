onload = ()=> {
    init();
}
//----------------------------------------------------------------
// FPS 
let cameraX = 0;
let cameraY = 0;
let cameraSpeed = 2;
let isMouseLocked = false;
let mouseX, mouseY;
let cameraVelocity = 0.3;
//----------------------------------------------------------------
// Canvas Base
let canvas, renderer, scene, camera, currentObject
let angle = 0.02;
let cameraPositionZ = 4;
let currentScale = 1;
let scaleFactor = 0.1;
//----------------------------------------------------------------
//Rotations
let rotationValues = [];
let possibleRotations = [       // x, y, z
    [0.1, 0.1, 0],
    [0, 0, 0.1],
    [0.1, 0, 0.1],
    [0, 0.1, 0.1],
    [0.1, 0.1, 0.1],
    [0.1, 0, 0],
    [0, 0.1, 0]
  ];  
let initialRotation = [];
let allObjects = [];
let allRotations = [];
let objects = [];
//----------------------------------------------------------------
//Colors
const colorList = [
    '#5333ed',
    '#2cd4d9',
    '#6E7076',
    '#FFA500',
    '#32CD32',
    '#800080',
    '#FF0000',
    '#0000FF',
    '#FFF0E6',
    '#808080',
    '#FFE082',
    '#008080',
  ];
/**
 * This method is used to move the camera with WASD keys, and adjusting it with the current camera position
 * 
 */

function movement(){
    document.addEventListener('keydown', function(event) {
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        switch (event.key) {
        case "s":
            camera.position.addScaledVector(cameraDirection, -0.1);
            break;
        case "w":
            camera.position.addScaledVector(cameraDirection, 0.1);
            break;
        case "a":
            const cameraLeft = new THREE.Vector3();
            cameraLeft.crossVectors(cameraDirection, camera.up);
            camera.position.addScaledVector(cameraLeft, -0.1);
            break;
        case "d":
            const cameraRight = new THREE.Vector3();
            cameraRight.crossVectors(cameraDirection, camera.up);
            camera.position.addScaledVector(cameraRight, 0.1);
            break;
        }
    }
    );

}

/**
 * This method is used to initialize the scene and call the objects, it will start the default lights aswell
 * 
 */
function init(){
    canvas = document.getElementById("gl-canvas");

    renderer = new THREE.WebGL1Renderer({canvas});
    renderer.setClearColor(0xffffff);

    renderer.setSize(canvas.width, canvas.height, false);

    scene = new THREE.Scene();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    lightChoice();
    FPS();
    const objectProbability = Math.ceil(generateRandomNumber(5, 30)); // 5 to 30
    console.log("Objetos criados: " + objectProbability);
    generateObjects(objectProbability);
    
    const fav = 75;
    const near = 0.1;
    const far = 5;

    const aspect = canvas.width / canvas.height;
    //Altera a perspectiva da camera
    camera = new THREE.PerspectiveCamera(fav,aspect,near,far)
    camera.position.z = cameraPositionZ;
    movement();
    render();
}

/**
 * This method is used to defined which objects will be in the scene, it is the one responsible to calculate
 * randomly what kind of object will be generated
 * @param {} numberOfObjects It is the random number between 5-30 of objects that will be generated
 */
function generateObjects(numberOfObjects){
    let i  = 0;
    while( i < numberOfObjects) {
        const modelProbability = 0.3; // 30% chance for a model
        const typeProbability = Math.random(); // Random number between 0 and 1
        if (typeProbability <= modelProbability) {
            makeModel();
        } else if( typeProbability > modelProbability) { 
            const solidTypeProbability = Math.random(); // Random number between 0 and 1
            if (solidTypeProbability > 0.5) {
                makeCube();
            } else if (solidTypeProbability <= 0.5){
                makePyramid();
            }
        }
        i++;
    }
}

/**
 * This method is used to generate random numbers, you choose a minimum and a maximum and it will generate a number between those
 * two, including them.
 * @param {*} min the minimum number reachable
 * @param {*} max the maximum number reachable
 * @returns the result of the random calculation
 */
function generateRandomNumber(min, max){
    return Math.random() * (max - min) + min;
}

/**
 * This method is used to generate the properties of a cube and add it in the scene, it only generates one cube
 * per call
 */
function makeCube() {
    const edgeLength = generateRandomNumber(0.1, 0.5); // 0.1 and 0.5
    const geometry = new THREE.BoxGeometry(edgeLength,edgeLength, edgeLength);
    let cube;
    let cubeColors = [];
    for (let i = 0; i < 6; i++) {
        let color = colorList[Math.floor(generateRandomNumber(0, colorList.length))];
        
        // Assures different colors for each face
        while (cubeColors.includes(color)) {
            color = colorList[Math.floor(generateRandomNumber(0, colorList.length))];
        }
        
        cubeColors.push(color);
    }
    const material = [
        new THREE.MeshLambertMaterial({ color: cubeColors.at(0)}), // Face da frente (vermelho)
        new THREE.MeshLambertMaterial({ color: cubeColors.at(1)}), // Face de trás (verde)
        new THREE.MeshLambertMaterial({ color: cubeColors.at(2)}), // Face superior (azul)
        new THREE.MeshLambertMaterial({ color: cubeColors.at(3)}),
        new THREE.MeshLambertMaterial({ color: cubeColors.at(4)}),
        new THREE.MeshLambertMaterial({ color: cubeColors.at(5)}),
    ];
    const textureProbability = Math.floor(generateRandomNumber(1, 100))
    if(textureProbability > 50){
        cube = new THREE.Mesh(geometry,material);
    }else{
        cube = new THREE.Mesh(geometry,textures());
    }
    //Positions
    const positionValues = randomPositions();
    cube.position.set(positionValues.at(0), positionValues.at(1), positionValues.at(2));
    allObjects.push(cube);

    const rotationValues = randomRotations();
    allRotations.push(rotationValues);

    scene.add(cube);
}

/**
 * This method is used to generate the properties of a pyramid and add it to the scene, it only generates one pyramid
 * per call
 */
function makePyramid() {
    const edgeLength = generateRandomNumber(0.1, 0.5); // 0.1 and 0.5
    const geometry = new THREE.TetrahedronGeometry(edgeLength);
    var pyramid;
    // Create an array of materials with different colors
    const materials = new THREE.MeshNormalMaterial();
    // Textures
    const textureProbability = Math.floor(generateRandomNumber(1, 100))
    if (textureProbability > 50) {
      pyramid = new THREE.Mesh(geometry, materials);
    } else {
      pyramid = new THREE.Mesh(geometry, textures());
    }
  
    //Positions
    const positionValues = randomPositions();
    pyramid.position.set(positionValues.at(0), positionValues.at(1), positionValues.at(2));
    allObjects.push(pyramid);

    const rotationValues = randomRotations();
    allRotations.push(rotationValues);

    scene.add(pyramid);
}


/**
 * This method is used to alternate between three different "custom" textures we are going to select for the 
 * cubes or pyramids that wont have static colors
 * @returns the corresponding material
 */
function textures(){
    const textureLoader = new THREE.TextureLoader();
    const texture1 = textureLoader.load('textures/FgZyTTXaUAA11E-.jpg');
    const texture2 = textureLoader.load('textures/images.jpg');
    const texture3 = textureLoader.load('textures/rat_gangsta_dude.jpg');

    const textureTypeProbability = Math.floor(generateRandomNumber(1, 100))
    const textureProbability = Math.floor(generateRandomNumber(1, 100))
    let material;
    if(textureTypeProbability < 65){
        if(textureProbability < 33){
            material = new THREE.MeshLambertMaterial({map: texture2});
        }else if(textureProbability >= 33 && textureProbability < 66){
            material = new THREE.MeshLambertMaterial({map: texture1});
        }else if(textureProbability >= 66){
            material = new THREE.MeshLambertMaterial({map: texture3});
        }
    }else {
        material = new THREE.MeshNormalMaterial();
    }

    return material;
}


/**
 * This method will be called once a model needs to be generated, it chooses randomly one of the .obj files 
 * from the modelos directory and its current texture, will generate the image and apply the texture and then
 * add it to the scene.
 * It also changes the default scale of the models to ensure they are visible.
 * 
 */

function makeModel(){
    var objectTextureName='';
    var objects = ['Astronaut', 'bird', 'cat', 'pig', 'tiger'];

    var randomIndex = Math.floor(Math.random() * objects.length);
    if(objects[randomIndex] == 'bird' || objects[randomIndex] == 'tiger'){
         objectTextureName= objects[randomIndex] + ".jpg";
        } 
    if(objects[randomIndex] == 'Astronaut' || objects[randomIndex] == 'cat' || objects[randomIndex] == 'pig'){
         objectTextureName= objects[randomIndex] + ".png";
    }
    var objeto=objects[randomIndex];
    var textureLoader = new THREE.TextureLoader();

    var texture = textureLoader.load('/modelos/'+objectTextureName);
    var material2 = new THREE.MeshLambertMaterial({ map: texture });

    var objLoader = new THREE.OBJLoader();

    objLoader.setPath('/modelos/');
    objLoader.load(objects[randomIndex]+".obj", function (object) {

        object.traverse(function(child){
            if(child instanceof THREE.Mesh){
                child.material=material2;
            }
        })
        switch(objeto){
            case 'tiger':
                object.scale.set(0.0004,0.0004,0.0004);
                break;
            case "Astronaut":
                object.scale.set(0.3,0.3,0.3);
                break;
            case 'pig':
                object.scale.set(0.01,0.01,0.01);
                break;
            case 'bird':
                object.scale.set(0.01,0.01,0.01);
                break;
            case 'cat':
                object.scale.set(0.02,0.02,0.02);
                break;
        }
        const objPositionValues = randomPositions();
        object.position.set(objPositionValues.at(0), objPositionValues.at(1), objPositionValues.at(2));
        allObjects.push(object);
        const rotationValues = randomRotations();
        allRotations.push(rotationValues);
        scene.add(object);
    });
}


/**
 * This method is used to get the html formulary information from the user, and add a light corresponding
 * to what is being asked.
 */

function lightChoice() {
    var lightType = document.getElementById('light-type').value;
    var intensity = document.getElementById('intensity').value;
    var directionX = document.getElementById('direction-x').value;
    var directionY = document.getElementById('direction-y').value;
    var directionZ = document.getElementById('direction-z').value;
    var targetX = document.getElementById('target-x').value;
    var targetY = document.getElementById('target-y').value;
    var targetZ = document.getElementById('target-z').value;
    switch (lightType) {
        case "point":
            // Luz pontual
            const pointLight = new THREE.PointLight(0xffffff, intensity);
            pointLight.position.set(directionX, directionY, directionZ);
            scene.add(pointLight);
            break;
        case "ambient":
            // Luz ambiente
            const ambientLight = new THREE.AmbientLight(0xffffff, intensity);
            scene.add(ambientLight);
            break;
        case "directional":
            // Luz direcional
            const directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
            directionalLight.position.set(directionX, directionY, directionZ);
            scene.add(directionalLight);
            break;
        case "spot":
            // Luz de spot
            const spotLight = new THREE.SpotLight(0xffffff, 1);
            spotLight.position.set(directionX, directionY, directionZ);
            spotLight.target.position.set(targetX, targetY, targetZ);
            spotLight.angle = Math.PI / 4;
            spotLight.penumbra = 0.05;
            spotLight.decay = 2;
            spotLight.distance = 10;

            scene.add(spotLight);
            scene.add(spotLight.target);
            break;
    }
}

/**
 * This method is used to reduce the ambient light in contact with the html
 */
function reduceLight(){

    const ambientLight2 = new THREE.AmbientLight(0xffffff, -0.1);
    scene.add(ambientLight2);


}


/**
 * This method is used to randomly generate the rotation values that the objects will have
 * @returns rotation values of the 3 coordinates
 */
function randomRotations(){
    const rotationProbability = Math.floor(generateRandomNumber(0, possibleRotations.length));
    const rotationIndex = possibleRotations[rotationProbability];
    return {x: rotationIndex.at(0), y: rotationIndex.at(1), z: rotationIndex.at(2)};
}

/**
 * This method is used to randomly generate the position values, the three coordinates needed to define the position
 * that the objets will be generated
 * @returns three coordinates that the objects will be generated
 */
function randomPositions(){
    const posX = Math.floor(generateRandomNumber(-10,10)); // -10 to 10
    const posY = Math.floor(generateRandomNumber(-1,1)); // -1 to 1
    const posZ = Math.floor(generateRandomNumber(-10,10)); // -10 to 10
    return [posX,posY,posZ];
}

/**
 * This method is used to let the mouse manipulate the camera, the way your cursor moves to, is the way 
 * it will be rotating, helping to explore the generated scene
 */

function FPS() {
    function handleMouseMove(event) {
        // Verifica se o rato está sobre o canvas
        if (event.target !== canvas) {
            return;
        }

        const movementX = event.movementX || event.mozMovementX  || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY  || event.webkitMovementY || 0;

        const sensitivity = 0.002; // Sensibilidade do movimento do rato

        // Atualiza a rotação da câmera com base na movimentação do rato
        camera.rotation.y -= movementX * sensitivity;
        camera.rotation.x -= movementY * sensitivity;

       
        // Limita a rotação vertical da câmera entre -PI/2 e PI/2 para evitar inversões
        //camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x)); //i need to do a commit
        }

        // Adiciona o listener de movimento do rato ao documento
        canvas.addEventListener('mousemove', handleMouseMove, false);

        // Desabilita a interação do rato quando o rato sai do canvas
        canvas.addEventListener('mouseleave', function () {
        canvas.removeEventListener('mousemove', handleMouseMove, false);
        });

        // Habilita a interação do rato quando o rato entra no canvas
        canvas.addEventListener('mouseenter', function () {
        canvas.addEventListener('mousemove', handleMouseMove, false);
    });
}


/**
 * This method defines the animations of the rotations and its speed
 */

function render() {
    const rotationSpeed = 0.2;
    for (let i = 0; i < allObjects.length; i++) {
        allObjects[i].rotation.x += allRotations[i].x * rotationSpeed;
        allObjects[i].rotation.y += allRotations[i].y * rotationSpeed;
        allObjects[i].rotation.z += allRotations[i].z * rotationSpeed;
    }
    renderer.render(scene, camera);

    requestAnimationFrame(render);
}