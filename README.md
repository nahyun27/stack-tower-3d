# 🎮 Stack Tower 3D

> **Test your timing. Build the tallest tower.**

An addictive 3D stacking game where precision matters. Click at the perfect moment to stack blocks and reach for the sky!

[![Live Demo](https://img.shields.io/badge/🎮-Play%20Now-blue?style=for-the-badge)](https://stack-tower-3d-game.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)

![Game Preview](public/preview.gif) *← Add screenshot/gif later*

## ✨ Features

- 🎯 **Precision Timing** - Click at the perfect moment to stack
- 🌈 **Rainbow Blocks** - Beautiful color gradient as you stack higher
- ⚡ **Physics-Based** - Realistic falling animations for missed parts
- 📊 **Score System** - Track your best score
- 🎨 **Minimalist Design** - Clean, distraction-free gameplay
- 📱 **Mobile Friendly** - Play on any device
- 🔊 **Sound Effects** - Satisfying audio feedback (coming soon)

## 🎮 How to Play

1. **Click/Tap** to drop the moving block
2. **Stack perfectly** on the previous block
3. **Build higher** - blocks get smaller if you miss
4. **Beat your high score!**

### Pro Tips
- Perfect placement = bonus points
- The bigger the overlap, the better
- Camera follows your tower upward

## 🛠 Tech Stack

- **[Next.js 15](https://nextjs.org)** - React framework
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)** - React renderer for Three.js
- **[Three.js](https://threejs.org)** - 3D graphics library
- **[@react-three/drei](https://github.com/pmndrs/drei)** - Useful R3F helpers
- **[@react-spring/three](https://www.react-spring.dev/)** - Spring physics animations
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/nahyun27/stack-tower-3d.git
cd stack-tower-3d

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start stacking!

## 📁 Project Structure
```
stack-tower-3d/
├── app/
│   ├── page.tsx              # Main game component
│   ├── layout.tsx            # Root layout
│   └── components/
│       ├── Game.tsx          # Game logic
│       ├── Block.tsx         # Block component
│       ├── Tower.tsx         # Tower manager
│       └── UI.tsx            # Score & UI
├── public/
│   └── sounds/               # Sound effects
├── README.md
└── package.json
```

## 🎨 Game Mechanics

### Stacking Logic
1. New block spawns and moves left-right
2. Player clicks to drop the block
3. Overlap area with previous block is calculated
4. Overlapping part stays, rest falls off with physics
5. Perfect placement (100% overlap) = bonus points
6. Repeat until tower is too small

### Scoring
- **+1 point** per successful stack
- **+5 bonus** for perfect placement
- **High score** saved in local storage

## 🔮 Roadmap

- [x] Core stacking mechanics
- [x] Physics for falling pieces
- [x] Score system
- [ ] Sound effects
- [ ] Leaderboard (online)
- [ ] Different block skins
- [ ] Power-ups
- [ ] Multiplayer mode

## 🎯 Development Timeline

**Week 1: Core Game** ✅
- Basic mechanics
- Stacking logic
- Visual polish

**Week 2: Features** 🚧
- Sound design
- UI improvements
- Mobile optimization

## 📸 Screenshots

*Coming soon - gameplay GIFs and images*

## 🐛 Known Issues

- Performance may vary on older mobile devices
- Safari may require interaction for audio

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this for learning or your own projects!

## 🙏 Acknowledgments

- Inspired by classic stacking games
- Built with love using React Three Fiber
- Thanks to the Three.js community

## 👤 Author

**Nahyun Kim**  
PhD Student in Computer Science | AI Security Researcher  
🔗 [GitHub](https://github.com/nahyun27) | 📧 ksknh7@hanyang.ac.kr

---

**Made with 🎮 for the joy of gaming**

*Perfect timing leads to perfect towers!*