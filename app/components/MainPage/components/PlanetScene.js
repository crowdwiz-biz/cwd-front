import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import planetImg from "assets/svg-images/svg-common/main-page/header/bg.png";
const PlanetScene = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        const setCanvasSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        setCanvasSize();
        // renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Создание звездного неба
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = -Math.random() * 2000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);


        // Создание кольца с градиентом
        const ringInnerRadius = 6;
        const ringOuterRadius = 10;
        const ringSegments = 64;

        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, ringSegments);

        const colors = [];
        const colorInner = new THREE.Color(0xffffff); // Белый цвет для внутреннего края
        const colorOuter = new THREE.Color(0x000000); // Черный цвет для внешнего края

        for (let i = 0; i < ringGeometry.attributes.position.count; i++) {
            const vertex = new THREE.Vector3().fromBufferAttribute(ringGeometry.attributes.position, i);
            const t = (vertex.length() - ringInnerRadius) / (ringOuterRadius - ringInnerRadius);
            const color = colorInner.clone().lerp(colorOuter, t);
            colors.push(color.r, color.g, color.b);
        }
        ringGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const ringMaterial = new THREE.MeshBasicMaterial({
            vertexColors: true, // Использовать цвета вершин
            side: THREE.DoubleSide, // Отображать обе стороны кольца
            transparent: true, // Включить прозрачность
            opacity: 1, // Убедитесь, что прозрачность не слишком низкая
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Поворот кольца, чтобы оно было горизонтальным
        ring.position.set(0, 0, 0.1); // Смещение кольца вперед по оси Z
        scene.add(ring);

        // Создание планеты
        const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
        const planetTexture = new THREE.TextureLoader().load(planetImg);
        const light = new THREE.PointLight(0xffffff, 2, 100);
        light.position.set(10, 10, 10);
        scene.add(light);
        const planetMaterial = new THREE.MeshBasicMaterial({
            map: planetTexture,
            transparent: true,
            opacity: 0.5,
            color: new THREE.Color(1, 0.9, 0.65),
            shininess: 100,
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        scene.add(planet);

        // Позиционирование камеры
        camera.position.z = 12;

        // Анимация
        const animate = () => {
            requestAnimationFrame(animate);

            // Вращение планеты
            planet.rotation.y += 0.003;

            const positions = starGeometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 2] += 0.5; // Двигаем звезды по оси Z
                if (positions[i + 2] > 1000) {
                    positions[i + 2] = -1000; // Если звезда ушла слишком далеко, возвращаем ее назад
                }
            }
            ring.rotation.y += 0.005;
            starGeometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        };

        animate();

        // Обработка изменения размера окна
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        window.addEventListener("resize", handleResize);

        // Очистка
        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef}></div>;
};

export default PlanetScene;
