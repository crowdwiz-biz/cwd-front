import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import planetImg from "assets/svg-images/svg-common/main-page/header/bg.png";

const PlanetScene = () => {
    const mountRef = useRef(null);
    const planetRef = useRef(null);
    const animationIdRef = useRef(null);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    useEffect(() => {
        // Инициализация рендерера
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        scene.background = new THREE.Color("rgba(28, 28, 28, 1)");
        camera.position.z = 12;

        const createStars = () => {
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(2000 * 3);

            for (let i = 0; i < 2000; i++) {
                vertices[i * 3] = (Math.random() - 0.5) * 2000;
                vertices[i * 3 + 1] = (Math.random() - 0.5) * 2000;
                vertices[i * 3 + 2] = -Math.random() * 2000;
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
            return new THREE.Points(
                geometry,
                new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 })
            );
        };

        scene.add(createStars());

        const planetTexture = new THREE.TextureLoader().load(planetImg);
        const planet = new THREE.Mesh(
            new THREE.SphereGeometry(5, 48, 48),
            new THREE.MeshBasicMaterial({
                map: planetTexture,
                transparent: true,
                opacity: 0.5,
                color: new THREE.Color(1, 0.9, 0.65)
            })
        );
        scene.add(planet);
        planetRef.current = planet;

        const light = new THREE.PointLight(0xffffff, 2, 100);
        light.position.set(10, 10, 10);
        scene.add(light);

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            planet.rotation.y += 0.0015;

            renderer.render(scene, camera);
        };
        animate();

        // Обработчик скролла
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = 1000;
            const progress = Math.min(scrollY / maxScroll, 1);

            // Плавное движение вниз с easing
            const easedProgress = easeOutCubic(progress);
            planet.position.y = -easedProgress * 15;

            // Плавное увеличение
            const scale = 1 + easedProgress * 1.2;
            planet.scale.set(scale, scale, scale);

            // Плавное исчезновение
            planet.material.opacity = 0.5 * (1 - easedProgress);

            // Приближение камеры
            camera.position.z = 12 + scrollY * -0.002;
        };

        // Easing-функция для плавности
        const easeOutCubic = (t) => {
            return 1 - Math.pow(1 - t, 3);
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        // Очистка
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationIdRef.current);
            mountRef.current && mountRef.current.removeChild(renderer.domElement);
            planetTexture.dispose();
        };

        function handleResize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }, []);

    return <div ref={mountRef} style={{ position: "fixed", top: 0, left: 0 }} />;
};

export default PlanetScene;
