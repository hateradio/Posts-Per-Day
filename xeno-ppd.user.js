// ==UserScript==
// @name     ResetEra: Display Posts Per Day
// @version  1
// @grant    none
// @match    *://*.resetera.com/members/*
// @match    *://*.neogaf.com/members/*
// ==/UserScript==

(() => {
    'use strict'

    class Posts {

        constructor() {
            let { joined, messages } = this.rawData
            console.log('Found date/messages:', joined, messages)
            this.messages = Posts.toInt(messages)

            joined = joined.split(' ')
            const month = Posts.MONTHS[joined[0]]
            const day = Posts.toInt(joined[1])
            const year = Posts.toInt(joined[2])

            this.joined = new Date(`${month} ${day} ${year}`)
            console.log('Detected date:', this.joined.toString())
        }

        diff(initial, latest) {
            return Math.floor((latest - initial) / Posts.MILLS_PER_DAY)
        }

        template(title, body) {
            return `<dl><dt>${title}:</dt><dd>${body}</dd></dl>`
        }

        get parent() {
            return document.querySelector('.secondaryContent.pairsJustified')
        }

        get rawData() {
            return Array.from(this.parent.querySelectorAll('dl'))
                .reduce((o, d) => {
                    const txt = d.textContent.split(':')
                    o[txt[0].trim().toLowerCase().replace(':', '')] = txt[1].trim()
                    return o
                }, {})
        }

        get average() {
            const days = this.diff(this.joined, new Date())
            return this.messages / days
        }

        static toInt(str) {
            return +(str.replace(/\D/g, ''))
        }

        static main() {
            const p = new Posts();
            const temp = p.template('Posts Per Day', p.average.toFixed(2))
            p.parent.insertAdjacentHTML('beforeend', temp)
        }

    }

    Posts.MILLS_PER_DAY = 24 * 60 * 60 * 1000

    Posts.MONTHS = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Sept: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12
    }

    Posts.main()

})()