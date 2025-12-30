jQuery(function () {

    if (JSINFO['se_suspend']) {
        jQuery('p.sectoggle').hide();
        SectionToggle.is_active = false;
    } else {
        SectionToggle.check_status();

        if (!SectionToggle.is_active) jQuery('p.sectoggle').hide();

        // TOC click handler
        if (SectionToggle.is_active && !JSINFO['toc_xcl']) {
            jQuery("ul.toc li div.li a, ul.toc li a").click(function () {
                var text = jQuery(this).html().toLowerCase().replace(/\s/g, "_");
                if (SectionToggle.toc_xcl.indexOf(text) > -1) return;
                var id = '#' + text;
                SectionToggle.checkheader(jQuery(id)[0]);
            });
        }

        // Initialize headers
        jQuery(SectionToggle.headers).each(function (_, elem) {
            var $elem = jQuery(elem);
            if (!$elem.next().length) return;

            // Wrap all content until next header
            var $content = $elem.nextUntil(':header');
            if (!$content.parent().hasClass('st_section_content')) {
                $content.wrapAll('<div class="st_section_content"></div>');
            }

            var level = SectionToggle.getHeaderLevel(elem);

            // Indent headers and content
            $elem.css('padding-left', (level - 1) * 20 + 'px');
            $elem.next('.st_section_content').css('padding-left', level * 20 + 'px');

            // Initialize collapsed state
            $elem.addClass('st_closed').css('cursor', 'pointer');
            $elem.next('.st_section_content').hide();

            // Open if hash matches
            var hash = $elem.html().replace(/\s/g, "_").toLowerCase();
            if (hash === SectionToggle.hash) {
                $elem.removeClass('st_closed').addClass('st_opened');
                $elem.next('.st_section_content').show();
            }

            // Bind click
            $elem.on('click', function () {
                SectionToggle.checkheader(this);
            });
        });

        if (JSINFO['start_open']) SectionToggle.open_all();
    }
});

var SectionToggle = {

    getHeaderLevel: function (el) {
        var tag = el.tagName.toLowerCase();
        if (tag.match(/^h[1-6]$/)) return parseInt(tag.substring(1), 10);
        return null;
    },

    checkheader: function (el) {
        var $el = jQuery(el);
        var level = this.getHeaderLevel(el);
        if (!level) return;

        var isOpen = !$el.hasClass('st_opened');
        $el.toggleClass('st_closed st_opened');

        var $next = $el.next();
        while ($next.length) {
            if ($next.is(':header')) {
                if (this.getHeaderLevel($next[0]) <= level) break;
            }
            isOpen ? $next.show() : $next.hide();
            $next = $next.next();
        }
    },

    open_all: function () {
        var self = this;
        jQuery(this.headers).each(function () {
            jQuery(this).removeClass('st_closed').addClass('st_opened');
            self.showContent(this);
        });
    },

    close_all: function () {
        var self = this;
        jQuery(this.headers).each(function () {
            jQuery(this).removeClass('st_opened').addClass('st_closed');
            self.hideContent(this);
        });
    },

    hideContent: function (el) {
        var level = this.getHeaderLevel(el);
        var $next = jQuery(el).next();
        while ($next.length) {
            if ($next.is(':header')) {
                if (this.getHeaderLevel($next[0]) <= level) break;
                $next.removeClass('st_opened').addClass('st_closed');
            }
            $next.hide();
            $next = $next.next();
        }
    },

    showContent: function (el) {
        var level = this.getHeaderLevel(el);
        var $next = jQuery(el).next();
        while ($next.length) {
            if ($next.is(':header')) {
                if (this.getHeaderLevel($next[0]) <= level) break;
            }
            $next.show();
            $next = $next.next();
        }
    },

    check_status: function () {
        if (JSINFO.se_platform == 'n') return;
        if (JSINFO.se_act != 'show') return;
        if (JSINFO.se_platform == 'a') this.is_active = true;
        else if (JSINFO.se_platform == 'm' && this.device_class.match(/mobile/)) this.is_active = true;

        if (this.is_active) {
            if (window.location.hash) {
                SectionToggle.hash = window.location.hash.toLowerCase().replace(/#/, "").replace(/\s/g, "_");
            }
            this.set_headers();
        }
    },

    set_headers: function () {
        var nheaders = parseInt(JSINFO['se_headers']) + 1;
        var xclheaders = new Array(0, 0, 0, 0, 0, 0, 0);
        if (JSINFO['se_xcl_headers']) {
            var xcl = JSINFO['se_xcl_headers'].split(',');
            for (var i = 0; i < xcl.length; i++) xclheaders[xcl[i]] = 1;
        }

        var which_id = '#dokuwiki__content';
        if (JSINFO['se_name'] != '_empty_' && JSINFO['se_template'] == 'other') which_id = JSINFO['se_name'];
        if (jQuery('div #section__toggle').length > 0) which_id = '#section__toggle';
        which_id = 'div ' + which_id;

        if (JSINFO['no_ini']) {
            var qstr = "";
            jQuery(":header").each(function () {
                var $id, $class = jQuery(this).attr('class');
                var tagname = jQuery(this).prop("tagName").toLowerCase();
                var matches = tagname.match(/h(\d)/);
                if (matches[1] > JSINFO['se_headers'] || xclheaders[matches[1]]) return;

                if ($class && !$class.match(/sr-only|toggle/)) {
                    var $classes = $class.match(/sectionedit\d+/);
                    if ($classes) tagname = tagname + "." + $classes[0];
                } else {
                    $id = jQuery(this).attr('id');
                    tagname = tagname + "#" + $id;
                }
                if (qstr) qstr += ',';
                qstr += tagname;
            });
            this.headers = qstr;
            return;
        }

        var id_string = "";
        for (var i = 1; i < nheaders; i++) {
            if (!xclheaders[i]) {
                id_string += which_id + ' h' + i;
                if (i < nheaders - 1) id_string += ',';
            }
        }
        id_string = id_string.replace(/,+$/, "");
        this.headers = id_string;
    },

    headers: "",
    toc_xcl: "",
    device_class: 'desktop',
    is_active: false,
    hash: "",
};
