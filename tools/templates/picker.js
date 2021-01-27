export default {

  /**
   * Finds items based on the provided query string
   * @param {*} q Query string
   * @return {object} Returns an object { id, title, link, img }
   */

  async find(q) {
    const params = {
      q,
      filters: 'branchURL:*',
    }
    const urlParams = new URLSearchParams(Object.entries(params));
    const res = await fetch(`https://spark-search.adobe.io/v2/content?${urlParams}`, { 
      headers: { 
        'x-api-key': 'Helix_Spark_Content_Search'
      },
    });

    const json = await res.json();
    const results = json._embedded && json._embedded.results ? json._embedded.results : [];
    const items = [];
    results.forEach(t => {
      const href = t.rendition.href
        .replace('\{format\}', 'jpg')
        .replace('\{dimension\}', 'width')
        .replace('\{size\}', t.rendition.maxWidth || 1200);

      items.push({
        id: t.branchURL,
        title: t.title,
        link: t.branchURL,
        img: href,
      });
    });

    return items;
  },

  buffer: {
    /**
     * Inits the copy buffer with an table
     * @param {*} id Id of the copy buffer dom element
     */
    init(id) {
      document.getElementById(id).innerHTML = `<table cellpadding="0" cellspacing="0" style="border: 1px solid black; border-spacing: 0; width: 100%">
        <thead>
            <tr>
              <th style="border: 1px solid black; background-color: rgb(211, 211, 211);" colspan="2">Template List</th>
            </tr>
        </thead>
        <tbody></tbody>
      </table>`;
    },

    /**
     * Inserts an item in the copy buffer
     * @param {string} id Id of the copy buffer dom element
     * @param {object} item The item
     */
    insert(id, item) {
      const tbody = document.querySelector(`#${id} tbody`);
      
      const row = document.createElement('tr');
      tbody.append(row);

      const imgCell = document.createElement('td');
      imgCell.style.border = '1px solid black';

      row.append(imgCell);
      const img = document.createElement('img');
      img.src = item.img;
      img.alt = item.title;
      img.width = '250';

      imgCell.append(img);

      const linkCell = document.createElement('td');
      linkCell.style.border = '1px solid black';
      row.append(linkCell);
      const link = document.createElement('a');
      link.href = item.link;
      link.innerHTML = 'Edit this template';
      linkCell.append(link);
    },

    /**
     * Clears the copy buffer
     * @param {string} id Id of the copy buffer dom element
     */
    clear(id) {
      const tbody = document.querySelector(`#${id} tbody`);
      tbody.innerHTML = '';
    }
  },
}

