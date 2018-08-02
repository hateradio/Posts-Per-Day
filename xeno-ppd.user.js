// ==UserScript==
// @name        ResetEra: Display Posts Per Day
// @description Displays posts per day average
// @version     2.1
// @match       *://*.resetera.com/members/*
// @match       *://*.resetera.com/threads/*
// @match       *://*.neogaf.com/members/*
// @match       *://*.neogaf.com/threads/*
// @grant       GM.log
// @namespace   hateradio)))
// ==/UserScript==

(() => {
    'use strict'

    class Posts {

        constructor(selector) {
            this.selector = selector
            let { joined, messages } = this.rawData
            console.log('Found date/messages:', joined, messages)

            this.messages = Posts.toInt(messages)
            this.joined = Posts.parseDate(joined)

            console.log('Detected date:', this.joined.toString())
        }

        diff(initial, latest) {
            return Math.floor((latest - initial) / Posts.MILLS_PER_DAY)
        }

        template(title, body) {
            return `<dl><dt>${title}:</dt><dd>${body}</dd></dl>`
        }

        append() {
            const temp = this.template('Posts Per Day', this.average.toFixed(2))
            this.parent.insertAdjacentHTML('beforeend', temp)
        }

        get parent() {
            return document.querySelector(this.selector)
        }

        get rawData() {
            console.log(this.selector, this.parent)
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

        static parseDate(date) {
            date = date.split(' ')
            const month = Posts.MONTHS[date[0]]
            const day = Posts.toInt(date[1])
            const year = Posts.toInt(date[2])

            return new Date(year, month, day)
        }

        static toInt(str) {
            return +(str.replace(/\D/g, ''))
        }

        static main() {
            const path = document.location.pathname.substr(1).split('/')[0]

            if (path === 'threads') {
                ModalPosts.listener()
            } else {
                const p = new Posts('.secondaryContent.pairsJustified')
                p.append()
            }
        }

    }

    class ModalPosts extends Posts {

        constructor(id) {
            super(`#memberCard${id}`);
        }

        template(title, body) {
            return `<dt>${title}:</dt><dd>${body}</dd>`
        }

        append() {
            const temp = this.template('Posts Per Day', this.average.toFixed(2))
            this.parent.querySelector('.userStats.pairsInline').insertAdjacentHTML('beforeend', temp)
        }

        get rawData() {
            const data = Array.from(this.parent.querySelectorAll('dd')).map(e => e.textContent)
            return {
                joined: data[0],
                messages: data[1]
            }
        }

        static listener() {
            document.body.addEventListener('click', (e) => {
                let { target } = e
                if (e && target && target.tagName === 'IMG') {
                    target = target.parentElement
                }
                console.log('target', target)
                const id = e && target && target.href && parseInt(target.href.split('.').pop(), 10)
                if (id && !ModalPosts.ID[id]) {
                    window.setTimeout(() => {
                        const p = new ModalPosts(id);
                        p.append()
                    }, 1000)
                    ModalPosts.ID[id] = true
                }
            }, false)
        }
    }

    // static inline constants aren't allowed in all browsers yet :(

    Posts.MILLS_PER_DAY = 24 * 60 * 60 * 1000

    Posts.MONTHS = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Sept: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
    }

    ModalPosts.ID = {}

    // window.setInterval(Posts.main, 5000)
    Posts.main()

})()