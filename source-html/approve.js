export const games = [
    {
        slug: 'duck',
        title: 'Duck Pipes',
        icon: 'duck',
        theme: 'amber',
        description: 'Lewati pipa dan kejar skor tertinggi.',
        file: 'duck.html',
        enabled: true
    },
    {
        slug: 'tebak-kata',
        title: 'Tebak Kata',
        icon: 'brainPuzzle',
        theme: 'violet',
        description: 'Pecahkan kata dari beberapa petunjuk.',
        file: 'tebak-kata.html',
        enabled: true
    },
    {
        slug: 'akinator',
        title: 'Akinator',
        icon: 'genie',
        theme: 'cyan',
        description: 'Pikirkan sesuatu dan biarkan Akinator menebaknya.',
        file: 'akinator.html',
        enabled: true
    },
    {
        slug: 'gudang-dorong',
        title: 'Gudang Dorong',
        icon: 'crateBox',
        theme: 'emerald',
        description: 'Dorong kotak ke tujuan di 8 level gudang.',
        file: 'gudang-dorong.html',
        enabled: true
    },
    {
        slug: 'benteng-saskeh',
        title: 'Benteng Saskeh',
        icon: 'castleTower',
        theme: 'rose',
        description: 'Bangun menara dan bertahan dari 10 gelombang musuh.',
        file: 'benteng-saskeh.html',
        enabled: true
    }
]

export function getGame(slug) {
    return games.find(game => game.enabled && game.slug === slug) || null
}
