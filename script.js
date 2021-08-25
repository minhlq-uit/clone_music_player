/**
 * 1. Render songs -> OK
 * 2. Scroll top -> OK
 * 3. Play / pause / seek -> OK
 * 4. CD rotatw -> OK
 * 5. Next / previous -> OK
 * 6. Random -> OK
 * 7. Next / Repeat when ended -> OK
 * 8. Active song -> OK
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MINH';

const player = $('.player');
const singer = $('h4');
const name = $('h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const play = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    oldIndex: [],
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            path: './assets/img/img1',
            name: 'Waiting for love',
            singer: 'Acivii',
            audio: './assets/audio/song1.mp3'
        },
        {
            path: './assets/img/img2',
            name: 'Hey brother',
            singer: 'Acivii',
            audio: './assets/audio/song2.mp3'
        },
        {
            path: './assets/img/img3',
            name: 'Wake me up',
            singer: 'Acivii',
            audio: './assets/audio/song3.mp3'
        },
        {
            path: './assets/img/img4',
            name: 'Believer',
            singer: 'Imagine Dragons',
            audio: './assets/audio/song4.mp3'
        },
        {
            path: './assets/img/img5',
            name: 'Lalala',
            singer: 'Naughty Bot',
            audio: './assets/audio/song5.mp3'
        },
        {
            path: './assets/img/img6',
            name: 'Navada',
            singer: 'Vicetone',
            audio: './assets/audio/song6.mp3'
        },
        {
            path: './assets/img/img7',
            name: 'The nights',
            singer: 'Avicii',
            audio: './assets/audio/song7.mp3'
        },
        {
            path: './assets/img/img8',
            name: 'The Spectre',
            singer: 'Alan Walker',
            audio: './assets/audio/song8.mp3'
        },
        {
            path: './assets/img/img9',
            name: 'On my way',
            singer: 'Alan Walker',
            audio: './assets/audio/song9.mp3'
        },
        {
            path: './assets/img/img10',
            name: 'All falls down',
            singer: 'Alan Walker',
            audio: './assets/audio/song10.mp3'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map( (song, index) => {
            return `
            <div id='song-id-${index}' class="song ${index === this.currentIndex ? 'active' : ''}" data-index='${index}'' >
                <div class="thumb" style="background-image: url(${song.path})">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="more">
                    <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                </div>
            </div>
            `
        }).join('');
        const playlist = $('.playlist');
        playlist.innerHTML = htmls;
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    loadCurrentSong: function() {
        singer.innerHTML = this.currentSong.singer;
        name.innerHTML = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.path})`;
        audio.src = this.currentSong.audio;

        // 
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

        // Object.assign(this, this.config);
    },
    renderConfig: function() {
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
    handleEvents: function() {
        // CD rotate
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity,
        });
        cdThumbAnimate.pause();
        // scroll
        const cd = $('.cd');
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const valueScroll = window.scrollY;
            const newCdWidth = cdWidth - valueScroll;
            cd.style.width = newCdWidth <= 0 ? 0 : newCdWidth + 'px';
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // lang nghe event play
        play.onclick = () => {
            if(this.isPlaying) {
                audio.pause();
            }
            else {
                audio.play();
            }
        }
        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            this.swapActiveSong();
            this.scrollToActiveSong();
        }
        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // evevt seek
        audio.ontimeupdate = function() {
            if(this.duration) {
                const currentValue = audio.currentTime / audio.duration * 100; 
                progress.value = currentValue;
            }
        }
        progress.oninput = () => {
            const seekTime = progress.value / 100 * audio.duration;
            audio.currentTime = seekTime;
        }

        // next song
        nextBtn.onclick = () => {
            if(this.isRandom) {
                this.playRandomSong();
            } else {
                this.nextSong();
            }
            audio.play();
        }
        //prev song
        prevBtn.onclick = () => {
            if(this.isRandom) {
                this.playRandomSong();
            } else {
                this.prevSong();
            }
            audio.play();
        }
        // random
        randomBtn.onclick = () => {
            this.isRandom = !this.isRandom;
            this.setConfig('isRandom', this.isRandom);
            randomBtn.classList.toggle('active', this.isRandom);
        }
        // next khi ended
        audio.onended = () => {
            if(this.isRepeat) {
                // 
            } else if (this.isRandom) {
                this.playRandomSong();
            } else {
                this.nextSong();
            }
            audio.play();
        }
        // reapeat
        repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat;
            this.setConfig('isRepeat', this.isRepeat);
            repeatBtn.classList.toggle('active', this.isRepeat);
        }
        // active song khi click
        playList.onclick = e => {
            const songNotActive = e.target.closest('.song:not(active');
            if(songNotActive || e.target.closest('.more')) {
                if(songNotActive) {
                    this.currentIndex = songNotActive.dataset.index;
                    this.loadCurrentSong();
                    this.swapActiveSong();
                    audio.play();
                }
            }
        }
        
    },
    swapActiveSong: function() {
        const songActive = $('.song.active');
        songActive.classList.remove('active');

        const isActiveSong = $(`#song-id-${this.currentIndex}`);
        isActiveSong.classList.add('active');
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth", 
                block: "end"
            })
        }, 250)
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        if(this.oldIndex.length === 0) {
            this.oldIndex.push(this.currentIndex);
        }
        if(this.oldIndex.length === this.songs.length) {
            this.oldIndex = [];
            this.oldIndex.push(this.currentIndex);
        }
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex || this.oldIndex.includes(newIndex));
        
        this.oldIndex.push(newIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        this.loadConfig();
        
        this.renderConfig();

        this.defineProperties();
        
        this.loadCurrentSong();
        
        this.handleEvents();
        
        this.render();
    },

};

app.start();