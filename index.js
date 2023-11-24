$(window).on("load", init_page());

window.addEventListener('popstate', function (e) {
    init_page();
});

$("#btn-top").on("click", function () {
    document.documentElement.scrollTop = 0;
});

function init_page() {
    // Get the URL of the current page. This url may not be correct or standardized.
    const url = new URL(window.location.href);

    // Get the pathname parameter in the URL.
    const pathname = url.searchParams.get("pathname");

    // Contruct the page URL that points to the source file from the pathname and the origin.
    const page_url = new URL(pathname, window.location.origin);

    // Contruct a targeted URL of the current page. This url is correct and standardized.
    // The default value is the origin.
    const new_url = new URL(window.location.origin);

    if (pathname == "/index.md") {
        // Pathname parameter is not wanted for the index page. So redirect the page to the origin.
        window.location.replace(window.location.origin);
    } else if (pathname == null && url.href == new_url.href) {
        // Return the index page when the URL is exactly the same as the origin.
        page_url.pathname = "/index.md";
    } else if (!fileExists(page_url)) {
        // Return the 404 page when the source file does not exist.
        page_url.pathname = "/404.md";
    }

    // Set the pathname parameter of the targeted URL when the page is not index page.
    if (page_url.pathname != "/index.md") {
        new_url.searchParams.set("pathname", page_url.pathname);
    }

    // Redirect the page to the targeted URL when the current URL is different from the targeted one.
    if (url.href != new_url.href) {
        window.location.replace(new_url);
    }

    // Get the extension of the source file.
    const ext = page_url.pathname.split(".").pop();

    // Parse the source file according to its extension.
    switch (ext) {
        case "md":
            parse_markdown(page_url);
            break
        default:
            console.log("extension", ext, "is not supported");
    }

    // Enable downloading the source file.
    $("#btn-download").attr("href", page_url);

    // Enable tootip.
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function load_page(page_url) {
    page_url = new URL(page_url);
    
    // Get the URL of the current page. This url may not be correct or standardized.
    const url = new URL(window.location.href);

    // Construct the targeted URL.
    const new_url = new URL(window.location.origin);
    new_url.searchParams.set("pathname", page_url.pathname);

    if (url.href == new_url.href) {
        alert("you are on the target page");
    } else {
        window.location.href = new_url.href;
    }
}

function fileExists(url) {
    var is_file = false;
    $.ajax({
        async: false,
        method: "HEAD",
        url: url
    }).done(function () {
        is_file = true;
    });
    return is_file;
}

function parse_markdown(md_url) {
    $.get({
        url: md_url
    }).done(function (data) {
        // Set up page title according to the H1 heading.
        if (md_url.pathname == "/index.md") {
            document.title = "Yanting's Blog";
        } else {
            document.title = data.match(/(?<=^# ).*/);
        }

        // Replace "_" with "\_" within "$$"" and "$$$$" to enable mathjax.
        data = data.replace(/(?<!\\)\$((?!(?<!\\)\$).)*\$/g, function (m) {
            return m.replace(/_/g, "\\_");
        });
        data = data.replace(/^\$\$[\s\S]+?\$\$/mg, function (m) {
            return m.replace(/_/g, "\\_");
        });

        const page_parent_url = get_page_parent_url();

        const $content = $($.parseHTML(marked.parse(data)));

        // Convert all img src in the current domain to the absolute URL. 
        $content.find("img").each(function () {
            if ((new URL($(this).prop("src"))).origin == window.location.origin) {
                $(this).attr("src", new URL($(this).attr("src"), page_parent_url));
                $(this).addClass("img-fluid");
            }
        });

        // Convert all link href in the current domain to the absolute URL.
        $content.find("a").each(function () {
            if ((new URL($(this).prop("href"))).origin == window.location.origin) {
                $(this).attr("href", new URL($(this).attr("href"), page_parent_url));
                let page_url = new URL($(this).attr("href"));
                let ext = page_url.href.split(".").pop();
                switch (ext) {
                    case "md":
                        $(this).attr("href", "javascript:void(0)");
                        $(this).on("click", function () {
                            load_page(page_url);
                        });
                        break
                }
            } else {
                $(this).attr("target", "_blank");
            }
        });

        $("#content").html($content);

        MathJax.typeset();
    })
}

function get_page_url() {
    // Get URL of current page.
    const url = new URL(window.location.href);

    // Get pathname parameter from the URL.
    const pathname = url.searchParams.get("pathname")

    // Construct a URL that points to the source file.
    const page_url = new URL(window.location.origin)
    if (pathname == null) {
        page_url.pathname = "/index.md";
    } else {
        page_url.pathname = pathname;
    }

    return page_url
}

function get_page_parent_url() {
    // Get the parent URL of the current source file.
    return new URL(".", get_page_url());
}