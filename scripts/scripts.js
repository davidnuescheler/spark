function toClassName(name) {
  return (name.toLowerCase().replace(/[^0-9a-z]/gi, '-'))
}


function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (let [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}  

function wrapSections(element) {
  document.querySelectorAll(element).forEach(($div) => {
      if (!$div.id) {
          const $wrapper=createTag('div', { class: 'section-wrapper'});
          $div.parentNode.appendChild($wrapper);
          $wrapper.appendChild($div);    
      }
  });
}

function decorateTables() {
  document.querySelectorAll('main div>table').forEach(($table) => {
    const $cols=$table.querySelectorAll('thead tr th');
    let cols=Array.from($cols).map((e) => toClassName(e.innerHTML)).filter(e => e?true:false);
    const $rows=$table.querySelectorAll('tbody tr');
    let $div={};
    /* workaround for import */
    if (cols.length==0) cols=['template-list'];
    $div=tableToDivs($table, cols) 
    $table.parentNode.replaceChild($div, $table);
  });
}
  
function tableToDivs($table, cols) {
  const $rows=$table.querySelectorAll('tbody tr');
  const $cards=createTag('div', {class:`${cols.join('-')} block`})
  $rows.forEach(($tr) => {
    const $card=createTag('div')
    $tr.querySelectorAll('td').forEach(($td, i) => {
      const $div=createTag('div', cols.length>1?{class: cols[i]}:{});
        $div.innerHTML=$td.innerHTML;
        $div.childNodes.forEach(($child) => {
          if ($child.nodeName=='#text') {
            const $p=createTag('p');
            $p.innerHTML=$child.nodeValue;
            $child.parentElement.replaceChild($p, $child);
          }
        })
        $card.append($div);
      });
      $cards.append($card);
    });
  return ($cards);
}  

function addDivClasses($element, selector, classes) {
  const $children=$element.querySelectorAll(selector);
  $children.forEach(($div, i) => {
      $div.classList.add(classes[i]);
  })
}

function decorateHeader() {
  const $header=document.querySelector('header');
  const classes=['logo', 'susi'];
  addDivClasses($header, ':scope>p', classes);
  $header.querySelector('.susi a').classList.add('button');
}

function decoratePictures() {
  if (!document.querySelector('picture')) {
      const helixImages=document.querySelectorAll('main img[src^="/hlx_"');
      helixImages.forEach($img => {
          const $pic=createTag('picture');
          const $parent=$img.parentNode;
          $pic.appendChild($img);
          $parent.appendChild($pic);
      })
  }
}

function decorateBlocks() {
  document.querySelectorAll('div.block').forEach(($block) => {
      const $section=$block.closest('.section-wrapper');
      if ($section) {
          const classes=Array.from($block.classList.values());
          $section.classList.add(classes[0]+'-container');
      }
  });
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 */
function loadCSS(href) {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', href);
  link.onload = () => {
  }
  link.onerror = () => {
  }
  document.head.appendChild(link);
};

function loadScript(url) {
  const $head=document.querySelector('head');
  const $script=createTag('script', {src: url});
  $head.append($script);
}


function decorateHero() {
  const $h1=document.querySelector('main h1');
  const $heroPicture=$h1.parentElement.querySelector('picture');
  let $heroSection;

  if ($h1) {
    const $main=document.querySelector('main');
    if ($main.children.length==1) {
      $heroSection=createTag('div', {class: 'section-wrapper hero'});
      const $div=createTag('div');
      $heroSection.append($div);
      if ($heroPicture) {
        $div.append($heroPicture);
      }
      $div.append($h1);
      $main.prepend($heroSection);
    } else {
      $heroSection=$h1.closest('.section-wrapper');
      $heroSection.classList.add('hero');
    }
  }
  if ($heroPicture) {
    $heroPicture.classList.add('hero-bg');
    const $heroImage=$heroPicture.querySelector('img');
    console.log($heroImage);
    $heroImage.addEventListener('load', () => {
      postLCP();
    })
  } else {
    $heroSection.classList.add('hero-noimage');
    postLCP();
  }

}

async function decorateExamplePages() {
  const usp=new URLSearchParams(window.location.search);
  const path=usp.get('urls');
  const $examplePages=document.getElementById('example-pages');
  if (path && $examplePages) {
    const $div=$examplePages.parentElement;
    const resp=await fetch(path);
    const json=await resp.json();
    const list=json.data;
    list.sort((e1,e2) => {
      return(e1.pathname.localeCompare(e2.pathname));
    });
    
    const $ol=createTag('ol');

    list.forEach((le) =>  {
      const $li=createTag('li');
      const pathname=le.pathname.split('.')[0];
      $li.innerHTML=`<a target="_blank" class="button" href="${pathname}">${pathname}</a>`;
      $ol.append($li)
    });
    $div.append($ol);
  }
}

function decorateButtons() {
  document.querySelectorAll('main a').forEach($a => {
      const $up=$a.parentElement;
      const $twoup=$a.parentElement.parentElement;
      if (!$a.querySelector('img')) {
        if ($up.childNodes.length==1 && $up.tagName=='P') {
          $a.className='button secondary';
          }
          if ($up.childNodes.length==1 && $up.tagName=='STRONG' && 
          $twoup.childNodes.length==1 && $twoup.tagName=='P') {
          $a.className='button primary';
          }    
      }
  })
}

async function loadLazyFooter() {
  const resp=await fetch('/lazy-footer.plain.html');
  const inner=await resp.text();
  const $footer=document.querySelector('footer');
  $footer.innerHTML=inner;
  $footer.querySelectorAll('a').forEach(($a) => {
    const url=new URL($a.href);
    if (url.hostname == 'spark.adobe.com') {
      const slash=url.pathname.endsWith('/')?1:0;
      $a.href=url.pathname.substr(0,url.pathname.length-slash);
    }
  })
  wrapSections('footer>div');
  addDivClasses($footer, 'footer > div', ['dark','grey','grey']);
  const $div=createTag('div', {class: 'hidden'});
  const $dark=document.querySelector('footer .dark>div');
  
  Array.from($dark.children).forEach(($e, i) => {
    if (i) $div.append($e);
  })

  $dark.append($div);

  $dark.addEventListener('click', (evt) => {
    $div.classList.toggle('hidden');
  })

}

function decorateTemplate() {
  if (window.location.pathname.includes('/make/')) {
    document.body.classList.add('make-page');
  }
  const year=window.location.pathname.match(/\/20\d\d\//);
  if (year) {
    document.body.classList.add('blog-page');
  }
}

function decorateBlogPage() {
  if (document.body.classList.contains('blog-page')) {
    const $sections=document.querySelectorAll('main>div.section-wrapper>div');
    const $body=$sections[1];
    let $by;
    let $postedOn;
    $body.querySelectorAll('p').forEach($p => {
      if (!$by && $p.textContent.toLowerCase().startsWith('by ')) $by=$p;
      if (!$postedOn && $p.textContent.toLowerCase().startsWith('posted on ')) $postedOn=$p;
    })
    const by=$by.textContent.substring(3);
    const posted=$postedOn.textContent.substring(10).split('-');
    var months= ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];
    $by.innerHTML=`<span class="byline"><img src="/icons/user.svg"> ${by} | ${months[+posted[0]-1]} ${posted[1]}, ${posted[2]} </span>`;
    $postedOn.remove();
  }
}

function decorateHowTo() {
  const $head=document.head;
  document.querySelectorAll('main .how-to-steps').forEach(($howto) => {
    const $heading=$howto.previousElementSibling;
    const $rows=Array.from($howto.children);
    const $schema=createTag('script', {type: 'application/ld+json'});
    let schema={
      "@context":"http://schema.org",
      "@type":"HowTo",
      "name": $heading.textContent ,"step":[]
    };

    $rows.forEach(($row, i)=> {
      const $cells=Array.from($row.children);
      const $number=createTag('div', {class: 'number'});
      $number.innerHTML='<span>'+(i+1)+'</span>';
      $row.prepend($number);
      schema.step.push( {
        "@type":"HowToStep",
        "position":i+1,
        "name": $cells[0].textContent,
        "itemListElement":{
          "@type":"HowToDirection",
          "text":$cells[1].textContent
        }
      })
      const $h3=createTag('h3');
      $h3.innerHTML=$cells[0].textContent;
      $cells[1].prepend($h3);
      $cells[1].classList.add('tip');
      $cells[0].remove();
    })
    $schema.innerHTML=JSON.stringify(schema);
    $head.append($schema);
  })


/*
<script type="application/ld+json">
    {"@context":"http://schema.org","@type":"HowTo","name":"How to make a billboard","step":[{"@type":"HowToStep","position":1,"name":"Start with inspiration","itemListElement":{"@type":"HowToDirection","text":"<p>We hook you up with thousands of professionally designed templates so you’re never starting from a blank canvas. Search by platform, task, aesthetic, mood, or color to have fresh inspiration at your fingertips. Once you find a graphic to start from, just tap or click to open the document in the editor.</p>"}},{"@type":"HowToStep","position":2,"name":"Remix it to make it your own","itemListElement":{"@type":"HowToDirection","text":"<p>There are lots of ways to personalize your billboard templates. Change up the copy and font. Sub out the imagery with your own photos. Or browse from thousands of free images right in Spark. Spend as little or as much time as you want making the graphic your own. With a premium plan, you can even auto-apply your brand logo, colors, and fonts so you’re always #onbrand.</p>"}},{"@type":"HowToStep","position":3,"name":"Amp up the flair","itemListElement":{"@type":"HowToDirection","text":"<p>It’s easy to add extra flair and personality to your projects with Spark’s exclusive design assets. Add animated stickers from GIPHY or apply a text animation for short-form graphic videos in one tap. We’ve taken care of all the boring technical stuff, so you can focus on your message and style. You can also add collaborators to your project, so you can have more hands on deck bringing your design to life.</p>"}},{"@type":"HowToStep","position":4,"name":"Resize to make your content go further","itemListElement":{"@type":"HowToDirection","text":"<p>Gone are the days of having to memorize image dimensions for every single platform. Once you’ve landed on a design you like, you can easily modify it for any printed need or social network by using Spark’s handy, auto-magical resize feature. Simply duplicate the project, hit resize, and select the platform you want to adapt it for and our AI will take care of the rest. Boom! Content for all your channels in a fraction of the time!</p>"}},{"@type":"HowToStep","position":5,"name":"Save and share your custom billboard","itemListElement":{"@type":"HowToDirection","text":"<p>Once your billboard is complete, hit that publish button! Instantly download your design to share with your billboard advertiser or professional printer. Upload your design to your social channels to share with all your followers. Adobe Spark saves your designs, so you can always revisit your project if you need to update it in the future.</p>"}}]}
</script></head>
*/

}

function decoratePage() {
    decoratePictures();
    decorateTables();
    wrapSections('main>div');
    decorateHeader();
    decorateHero();
    decorateBlocks();
    decorateTemplate();
    decorateButtons();
    decorateHowTo();
    decorateExamplePages();
    decorateBlogPage();
}

function postLCP() {
  loadCSS('/styles/lazy-styles.css');
  loadLazyFooter();
  if (window.location.search=='?martech') loadScript('/scripts/martech.js');
  
}

decoratePage();
