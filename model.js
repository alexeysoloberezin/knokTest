$(document).ready(function () {
  // Model for an item within a document category
  function DocumentItem(key, name) {
    this.key = key;
    this.name = name;
    this.type = 'item';
  }

  // Model for a document category
  function DocumentCategory(title, items) {
    var self = this;
    self.title = title;
    self.items = ko.observableArray(items);
    self.isVisible = ko.observable(false);
    self.type = 'category';

    self.toggleVisibility = function () {
      self.isVisible(!self.isVisible());
    };
  }

  // Data
  var docListData = [
    new DocumentCategory("Обязательные для всех", [
      new DocumentItem('pass', 'Паспорт'),
      new DocumentItem('inn', 'ИНН'),
      new DocumentItem('sns', 'СНИЛС'),
      new DocumentItem('example 1', 'Пример 1'),
    ]),
    new DocumentCategory("Обязательные для трудоустройства", [
      new DocumentItem('pass', 'Паспорт'),
      new DocumentItem('inn', 'ИНН')
    ]),
    new DocumentCategory("Специальные", []),
    new DocumentCategory("Example 2", []),
  ];

  let currentDrag = null;
  let cloneElement = null;
  let currentDragElementType = null;
  let offsetX, offsetY;

  // ViewModel
  var viewModel = {
    docList: ko.observableArray(docListData),
  };

  const doc = $('body');


  doc.on('drop', '.doc-category-title.category, .doc-category-title.item', function (event) {
    event.preventDefault();

    const targetType = $(this).attr('data-type');
    const dropCategoryIndex = parseInt($(this).closest('.doc-category').attr('data-key'));
    const dropItemIndex = targetType === 'item' ? parseInt($(this).attr('data-key')) : null;

    if (currentDragElementType === 'item') {
      const draggedCategoryIndex = currentDrag;
      const draggedItemIndex = parseInt($('.doc-category-title.item.clone-drag').attr('data-key'));

      const draggedItem = viewModel.docList()[draggedCategoryIndex].items.splice(draggedItemIndex, 1)[0];


      if (targetType === 'category') {
        viewModel.docList()[dropCategoryIndex].items.unshift(draggedItem);
      } else if (targetType === 'item') {
        viewModel.docList()[dropCategoryIndex].items.splice(dropItemIndex, 0, draggedItem);
      }
    } else if (currentDragElementType === 'category') {
      const draggedCategory = viewModel.docList.splice(currentDrag, 1)[0];
      viewModel.docList.splice(dropCategoryIndex, 0, draggedCategory);
    }

    cloneElement.remove();
    $('.clone-drag').remove();

    $(this).removeClass('dragover');

    currentDragElementType = null;
  });

  doc.on('dragover', '.doc-category-title.category, .doc-category-title.item', function (event) {
    event.preventDefault();
    console.log('dragover', 'dragover')

    cloneElement.css({
      left: event.pageX - offsetX,
      top: event.pageY - offsetY
    });

    $(this).addClass('dragover');
  });

  doc.on('mouseleave', function (e){
    console.log('mouseleave')
    cloneElement.remove();
    $('.clone-drag').remove();
  })

  doc.on('dragstart', '.doc-category-title.category, .doc-category-title.item', function (event) {
    $('.clone-drag').remove();

    currentDragElementType = $(this).attr('data-type');

    if (currentDragElementType === 'item') {
      const itemIndex = parseInt($(this).attr('data-key'));
      currentDrag = parseInt($(this).closest('.doc-category').attr('data-key'));

      cloneElement = $(this).clone();
      cloneElement.addClass('clone-drag');
    } else {
      currentDrag = parseInt($(this).closest('.doc-category').attr('data-key'));
      cloneElement = $(this).closest('.doc-category').clone();
      cloneElement.addClass('clone-drag');
    }

    const initialElementX = $(this).offset().left;
    const initialElementY = $(this).offset().top;

    offsetX = event.pageX - initialElementX;
    offsetY = event.pageY - initialElementY;

    cloneElement.css({
      position: 'absolute',
      pointerEvents: 'none',
      opacity: 1,
      boxShadow: '0 3px 16px #0066FFB2',
      left: initialElementX,
      top: initialElementY,
      width: $(this).width(),
      zIndex: 1000
    }).appendTo('body');

    event.originalEvent.dataTransfer.setData('text/plain', ''); // Нужно для корректной работы drag & drop
  });

  doc.on('dragleave', '.doc-category-title.category, .doc-category-title.item', function (event) {
    $(this).removeClass('dragover');
  });

  ko.applyBindings(viewModel);
});