console.log("Project (Spotify - Web Player: Music for everyone)");

// Convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2,'0')}:${String(remainingSeconds).padStart(2,'0')}`;
}

let currentFolder;
let currentSong = new Audio();
let songs = [];

// Fetch songs from folder and display
async function getSongs(folder) {
    currentFolder = folder;
    let response = await fetch(`http://127.0.0.1:5500/${currentFolder}/`);
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");
    songs = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(link.href.split(`/${currentFolder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
            <li>
                <div class="info-1">
                    <img class="invert" src="Images/music.svg" alt="music-icon">
                    <div class="info-2">
                        <div>${song.replaceAll("%20"," ").replaceAll("%26","&")}</div>
                    </div> 
                </div>
                <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="/Images/playNow.svg" alt="play">
                </div>
            </li>
        `;
    }

    // Click event for each song
    Array.from(songUl.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info-2 div").innerHTML.trim();
            playMusic(track);
        });
    });

    return songs;
}

// Play a song and update UI
const playMusic = (track) => {
    currentSong.src = `/${currentFolder}/` + track;
    currentSong.play();
    document.getElementById("play").src = "Images/pause.svg";
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
    document.querySelector(".circle").style.left = "0%";
}

// Main
async function main() {
    await getSongs("Songs/CS");

    // Display first song info but don't auto-play
    if (songs.length > 0) {
        document.querySelector(".song-info").innerHTML = decodeURI(songs[0]);
        document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
        document.querySelector(".circle").style.left = "0%";
    }

    const playBtn = document.getElementById("play");
    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("previous");

    // Play/Pause toggle
    playBtn.addEventListener("click", () => {
        if (currentSong.src === "" && songs.length > 0) {
            // If no song loaded yet, load first
            playMusic(songs[0]);
        } else if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "Images/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "Images/playbar-play.svg";
        }
    });

    // Update seekbar and time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 99.5 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 99.5;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    // Previous song
    prevBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Next song
    nextBtn.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value)/100;
    });

    // Playlist cards click
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            await getSongs(`Songs/${card.dataset.folder}`);
            if (songs.length > 0) {
                document.querySelector(".song-info").innerHTML = decodeURI(songs[0]);
                document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
                document.querySelector(".circle").style.left = "0%";
            }
        });
    });

    // Auto-play next song when current ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        } else {
            playBtn.src = "Images/playbar-play.svg";
        }
    });
    
    // Mute tracks
    document.querySelector(".range>img").addEventListener("click", e =>{
        console.log(e.target)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.15
            document.querySelector(".range").getElementsByTagName("input")[0].value = 15
        }
    })
}

main();