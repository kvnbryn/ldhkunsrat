document.addEventListener('DOMContentLoaded', () => {

    // --- MAIN FUNCTION ---
    async function initWebsite() {
        try {
            const response = await fetch('konten.json');
            if (!response.ok) throw new Error(`Gagal memuat konten.json: ${response.statusText}`);
            const data = await response.json();

            // Render all sections with data
            renderUmum(data.umum);
            renderBeranda(data.beranda);
            renderProfil(data.profil);
            renderPengurus(data.pengurus);
            renderDemisioner(data.demisioner);
            renderPrestasi(data.prestasi);
            renderELibrary(data.umum); // uses general data
            renderAktivitas(data.aktivitas);
            renderKontak(data.umum); // uses general data

            // Initialize all dynamic components AFTER content is loaded
            initStaticScripts();
            
        } catch (error) {
            console.error("Tidak dapat menginisialisasi website:", error);
            // Optionally, show an error message to the user on the page
            document.body.innerHTML = `<div class="text-center p-10 text-red-500">Gagal memuat konten website. Periksa file konten.json. Error: ${error.message}</div>`;
        }
    }

    // --- RENDER FUNCTIONS ---
    
    function renderUmum(data) {
        document.title = data.judulWebsite;
        document.getElementById('nav-title').textContent = data.namaOrganisasi;
    }

    function renderBeranda(data) {
        setTextContent('hero-title', data.judul);
        setTextContent('hero-subtitle', data.subJudul);
        setTextContent('hero-description', data.deskripsi);
        setImageSource('hero-image-kabinet', data.gambarKabinet);
    }
    
    function renderProfil(data) {
        setImageSource('profil-logo', data.gambarLogo);
        setTextContent('profil-deskripsi', data.deskripsiSingkat);
        setTextContent('profil-tujuan', data.tujuan);
        
        const usahaList = document.getElementById('profil-usaha');
        usahaList.innerHTML = data.usaha.map(item => `
            <li class="flex items-start">
                <i class="${item.icon} text-brandRed mt-1 mr-4 w-5 text-center"></i>
                <span>${item.text}</span>
            </li>
        `).join('');
    }

    function renderPengurus(data) {
        setTextContent('pengurus-nama-kabinet', `${data.namaKabinet} - ${data.periode}`);
        setTextContent('pengurus-deskripsi', data.deskripsi);

        const track = document.getElementById('pengurus-slider-track');
        track.innerHTML = ''; // Clear existing

        // Slide 1: BPH
        const bphSlide = document.createElement('div');
        bphSlide.className = 'pengurus-slide-item';
        const ketum = data.bphInti.ketuaUmum;
        let bphHtml = `
            <div class="text-center">
                <div class="inline-block leader-card mb-12">
                    <img src="${ketum.foto}" alt="${ketum.nama}" onerror="this.onerror=null;this.src='https://placehold.co/300x400/CCCCCC/FFFFFF?text=Foto';">
                    <p class="name">${ketum.nama}</p>
                    <p class="title">${ketum.jabatan}</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    ${data.bphInti.lainnya.map(p => `
                        <div class="sub-leader-card">
                            <img src="${p.foto}" alt="${p.nama}" onerror="this.onerror=null;this.src='https://placehold.co/300x400/CCCCCC/FFFFFF?text=Foto';">
                            <p class="name">${p.nama}</p>
                            <p class="title">${p.jabatan}</p>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        bphSlide.innerHTML = bphHtml;
        track.appendChild(bphSlide);
        
        // Slides for each department
        data.departemen.forEach(dept => {
            const deptSlide = document.createElement('div');
            deptSlide.className = 'pengurus-slide-item';
            let staffHtml = dept.divisi.map(div => `
                <div class="staff-block">
                    <p class="font-bold text-gray-800">${div.namaDeputi}</p>
                    <p class="text-gray-600 mb-2 text-sm">${div.jabatanDeputi}</p>
                    <p class="font-bold text-gray-800">${div.wakilDeputi}</p>
                    <p class="text-gray-600 mb-2 text-sm">${div.jabatanWakil}</p>
                    <p class="font-bold text-gray-800 mt-3">Staff:</p>
                    <ul class="list-disc text-gray-600 text-sm">
                        ${div.staff.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                </div>
            `).join('');

            deptSlide.innerHTML = `
                <div class="department-card">
                   <h3 class="text-xl font-bold text-center text-brandRed-dark mb-6 font-serif">${dept.nama}</h3>
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 mb-6 text-center">
                       ${dept.pimpinan.map(p => `
                           <div class="sub-leader-card">
                               <img src="${p.foto}" alt="${p.nama}" onerror="this.onerror=null;this.src='https://placehold.co/300x400/CCCCCC/FFFFFF?text=Foto';">
                               <p class="name">${p.nama}</p>
                               <p class="title">${p.jabatan}</p>
                           </div>
                       `).join('')}
                   </div>
                   <hr class="mb-6">
                   <div class="department-staff-grid">${staffHtml}</div>
               </div>`;
            track.appendChild(deptSlide);
        });
    }

    function renderDemisioner(data) {
        setTextContent('demisioner-title', data.judul);
        setTextContent('demisioner-description', data.deskripsi);
        const container = document.getElementById('accordion-container');
        container.innerHTML = data.kabinets.map(kabinet => {
            const intiHtml = kabinet.inti.map(p => `<div class="demisioner-item"><p class="name">${p.nama}</p><p class="title">${p.jabatan}</p></div>`).join('');
            const direkturHtml = kabinet.direktur.length > 0 ? `
                <h4 class="text-lg font-semibold text-brandRed-dark mb-4 mt-8 font-serif border-l-4 border-brandRed pl-3">Direktur & Sekretaris</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">${kabinet.direktur.map(p => `<div class="demisioner-item"><p class="name">${p.nama}</p><p class="title">${p.jabatan}</p></div>`).join('')}</div>
            ` : '';

            return `
                <div class="accordion-item">
                    <div class="accordion-header">
                        <h3>${kabinet.nama}</h3>
                        <i class="fas fa-chevron-down accordion-icon"></i>
                    </div>
                    <div class="accordion-content">
                        <div class="demisioner-list">
                            <h4 class="text-lg font-semibold text-brandRed-dark mb-4 mt-2 font-serif border-l-4 border-brandRed pl-3">Presidium Inti</h4>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">${intiHtml}</div>
                            ${direkturHtml}
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    function renderPrestasi(data) {
        setTextContent('prestasi-title', data.judul);
        setTextContent('prestasi-description', data.deskripsi);
        const gallery = document.getElementById('prestasi-gallery');
        gallery.innerHTML = data.items.map(item => `
            <div class="gallery-item group" 
                 data-images='["${item.gambar}"]'
                 data-title="${item.deskripsi}">
                <img src="${item.gambar}" alt="${item.judul}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/a91d3a/ffffff?text=Juara';">
                <div class="gallery-overlay p-4 flex flex-col justify-end text-left">
                    <h3 class="text-lg font-bold text-white mb-1">${item.judul}</h3>
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-20 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span class="text-white bg-brandRed rounded-full p-4 leading-none"><i class="fas fa-search-plus text-xl"></i></span>
                </div>
            </div>
        `).join('');
    }
    
    function renderELibrary(data) {
        document.getElementById('elibrary-link').href = data.elibrary;
    }

    function renderAktivitas(data) {
        setTextContent('aktivitas-title', data.judul);
        setTextContent('aktivitas-description', data.deskripsi);
        const gallery = document.getElementById('aktivitas-gallery');
        gallery.innerHTML = data.items.map(item => `
            <div class="gallery-item group"
                 data-title="${item.judul}"
                 data-images='${JSON.stringify(item.koleksiGambar)}'>
                <img src="${item.gambarSampul}" alt="${item.judul}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/600x400/333333/FFFFFF?text=Aktivitas';">
                <div class="gallery-overlay p-4 flex flex-col justify-end text-left">
                    <h3 class="text-lg font-bold text-white mb-1">${item.judul}</h3>
                    <p class="text-sm text-gray-200 flex items-center"><i class="fas fa-images mr-2"></i>${item.jumlahFoto} Foto</p>
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-20 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <span class="text-white bg-brandRed rounded-full p-4 leading-none"><i class="fas fa-search-plus text-xl"></i></span>
                </div>
            </div>
        `).join('');
    }

    function renderKontak(data) {
        document.getElementById('kontak-linktree').href = data.linktree;
        const socialContainer = document.getElementById('kontak-social-media');
        socialContainer.innerHTML = `
            <a href="${data.sosialMedia.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="text-2xl text-white opacity-75 hover:opacity-100 hover:scale-110 transform transition-all duration-300">
                <i class="fab fa-instagram"></i>
            </a>
            <a href="${data.sosialMedia.tiktok}" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="text-2xl text-white opacity-75 hover:opacity-100 hover:scale-110 transform transition-all duration-300">
                <i class="fab fa-tiktok"></i>
            </a>
            <a href="${data.sosialMedia.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="text-2xl text-white opacity-75 hover:opacity-100 hover:scale-110 transform transition-all duration-300">
                <i class="fab fa-youtube"></i>
            </a>
             <a href="${data.sosialMedia.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="text-2xl text-white opacity-75 hover:opacity-100 hover:scale-110 transform transition-all duration-300">
                <i class="fab fa-facebook-f"></i>
            </a>
        `;
    }

    // --- HELPER FUNCTIONS ---
    function setTextContent(id, text) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }
    
    function setImageSource(id, src) {
        const element = document.getElementById(id);
        if (element) element.src = src;
    }

    // --- SCRIPTS FOR DYNAMIC COMPONENTS ---
    // This function initializes scripts that depend on the DOM being ready
    function initStaticScripts() {
        // Preloader
        window.addEventListener('load', () => {
            const preloader = document.getElementById('preloader');
            if(preloader) preloader.classList.add('hidden');
        });

        // Mobile Menu
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const desktopNav = document.querySelector('.hidden.md\\:flex.space-x-8');
        if (desktopNav) {
            mobileMenu.innerHTML = desktopNav.innerHTML; // Clone nav links
        }
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
            });
        }
        
        // Navbar Scroll Effect
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('shadow-md', window.scrollY > 50);
            });
        }
        
        // Active Nav Link on Scroll
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');
        const updateActiveNavLink = () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
                    link.classList.add('active');
                }
            });
            
            if (window.pageYOffset < 50) {
                navLinks.forEach(l => l.classList.remove('active'));
                const homeLink = document.querySelector('a[href="#home"].nav-link');
                if(homeLink) homeLink.classList.add('active');
            }
        };
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink();

        // Accordion Logic
        const accordionItems = document.querySelectorAll('.accordion-item');
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');
            if (header && content) {
                header.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    accordionItems.forEach(i => {
                        i.classList.remove('active');
                        const otherContent = i.querySelector('.accordion-content');
                        if(otherContent) otherContent.style.maxHeight = '0px';
                    });
                    if (!isActive) {
                        item.classList.add('active');
                        content.style.maxHeight = content.scrollHeight + 50 + 'px';
                    }
                });
            }
        });

        // Pengurus Slider Logic
        setupPengurusSlider();

        // Unified Gallery Modal & Slideshow Logic
        setupGalleryModal();

        // Copyright Year
        const currentYearSpan = document.getElementById('current-year');
        if(currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    
    function setupPengurusSlider() {
        const wrapper = document.getElementById('pengurus-slider-wrapper');
        const slides = document.querySelectorAll('.pengurus-slide-item');
        const prevBtn = document.getElementById('prevPengurusBtn');
        const nextBtn = document.getElementById('nextPengurusBtn');
        const dotsContainer = document.getElementById('dots-indicator');
        if (!wrapper || slides.length === 0 || !prevBtn || !nextBtn || !dotsContainer) return;

        let currentIndex = 0;
        const totalSlides = slides.length;
        let scrollTimeout;

        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.dot');

        const updateSliderHeight = () => {
            if (slides[currentIndex]) {
                const currentSlideHeight = slides[currentIndex].offsetHeight;
                wrapper.style.height = `${currentSlideHeight}px`;
            }
        };

        const goToSlide = (index) => {
            const slideWidth = wrapper.offsetWidth;
            wrapper.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
        };
        
        const updateActiveState = () => {
             const slideWidth = wrapper.offsetWidth;
             const newIndex = Math.round(wrapper.scrollLeft / slideWidth);
             if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                if(dots.length > 0) {
                    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
                }
                updateSliderHeight();
             }
        };

        prevBtn.addEventListener('click', () => goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0));
        wrapper.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveState, 150);
        });
        window.addEventListener('resize', updateSliderHeight, { passive: true });
        
        if (dots.length > 0) dots[0].classList.add('active');
        setTimeout(updateSliderHeight, 300); // Give a bit of time for images to load
    };
    
    function setupGalleryModal() {
        const modal = document.getElementById('gallery-modal');
        if (!modal) return;

        const modalImg = document.getElementById('modal-img');
        const modalTitle = document.getElementById('modal-title');
        const modalCounter = document.getElementById('modal-counter');
        const closeBtn = document.getElementById('modal-close-btn');
        const nextBtn = document.getElementById('modal-next-btn');
        const prevBtn = document.getElementById('modal-prev-btn');
        const galleryItems = document.querySelectorAll('#prestasi .gallery-item, #aktivitas .gallery-item');
        
        let currentImages = [];
        let currentIndex = 0;

        const showImage = (index) => {
            modalImg.style.opacity = '0';
            setTimeout(() => {
                modalImg.src = currentImages[index];
                 modalImg.onerror = function() { this.onerror=null; this.src='https://placehold.co/800x600/CCCCCC/FFFFFF?text=Gambar+tidak+ditemukan'; };
                modalImg.style.opacity = '1';
            }, 150);
            modalCounter.textContent = `Foto ${index + 1} dari ${currentImages.length}`;
            const showNav = currentImages.length > 1;
            nextBtn.style.display = showNav ? 'flex' : 'none';
            prevBtn.style.display = showNav ? 'flex' : 'none';
        };

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.dataset.title;
                const imagesAttr = item.dataset.images;
                if (!imagesAttr) return;

                 try {
                    currentImages = JSON.parse(imagesAttr);
                } catch (e) {
                    console.error("Error parsing gallery images data:", e);
                    return;
                }

                if (Array.isArray(currentImages) && currentImages.length > 0) {
                    currentIndex = 0;
                    modalTitle.textContent = title;
                    showImage(currentIndex);
                    modal.classList.add('active');
                }
            });
        });

        const showNextImage = () => {
            if (currentImages.length === 0) return;
            currentIndex = (currentIndex + 1) % currentImages.length;
            showImage(currentIndex);
        };

        const showPrevImage = () => {
            if (currentImages.length === 0) return;
            currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
            showImage(currentIndex);
        };

        const closeModal = () => modal.classList.remove('active');

        nextBtn.addEventListener('click', showNextImage);
        prevBtn.addEventListener('click', showPrevImage);
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { 
            if (e.target.id === 'gallery-modal') closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'Escape') closeModal();
        });
    };

    // --- START THE APP ---
    initWebsite();

});
