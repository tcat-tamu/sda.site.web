define(function (require) {

   var Marionette = require('marionette');
   var nunjucks = require('nunjucks');
   var _ = require('underscore');

   var REGEX_STRIP_TAGS = /(<([^>]+)>)/ig;

   var env = nunjucks.configure();

   env.addFilter('striptags', function (str) {
      return str.replace(REGEX_STRIP_TAGS, '');
   });

   var AuthorView = Marionette.ItemView.extend({
      template: function (ctx) {
         var fname = ctx.firstName ? ctx.firstName : '';
         var lname = ctx.lastName ? ctx.lastName : '';
         return fname + ' ' + lname + ' ';
      },

      tagName: 'a',

      className: 'author',

      events: {
         click: function (evt) {
            evt.preventDefault();
            var authorId = this.model.get('authorId');

            if (authorId) {
               this.routerChannel.command('author:show', authorId);
            }
         }
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel']);
      },

      onShow: function () {
         if (!this.model.get('authorId')) {
            this.$el.addClass('disabled');
         }
      }
   });

   var AuthorsView = Marionette.CollectionView.extend({
      tagName: 'span',
      className: 'authors',
      childView: AuthorView,

      childViewOptions: function () {
         return {
            routerChannel: this.routerChannel
         };
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel']);
      }
   });

   var PublicationInfoView = Marionette.ItemView.extend({
      template: _.partial(nunjucks.render, 'biblio/pubinfo.html'),
      tagName: 'span'
   });

   var VolumeView = Marionette.LayoutView.extend({
      template: _.partial(nunjucks.render, 'biblio/volume.html'),
      tagName: 'section',
      className: 'volume',

      regions: {
         authors: '> .citation > .authors',
         pubInfo: '> .citation > .pubinfo'
      },

      templateHelpers: function () {
         var title = this.model.getCanonicalTitle();
         return {
            title: title ? title.getFullTitle() : 'Unknown Title',
            copyRef: this.copyRef
         };
      },

      events: {
         'click .volume-copy.readonline': function () {
            var copyId = this.copyRef.get('copyId');
            this.routerChannel.command('bookreader:show', copyId, { trigger: true });
         }
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel', 'copyRefs']);

         this.copyRef = this.copyRefs.findWhere({
            associatedEntry: this.model.getUri()
         });
      },

      onShow: function () {
         var authorsView = new AuthorsView({
            collection: this.model.get('authors'),
            routerChannel: this.routerChannel
         });

         this.getRegion('authors').show(authorsView);


         var pubInfoView = new PublicationInfoView({
            model: this.model.get('publicationInfo')
         });

         this.getRegion('pubInfo').show(pubInfoView);
      }
   });

   var VolumesView = Marionette.CollectionView.extend({
      childView: VolumeView,

      childViewOptions: function () {
         return {
            routerChannel: this.routerChannel,
            copyRefs: this.copyRefs
         };
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel', 'copyRefs']);
      }
   });

   var EditionView = Marionette.LayoutView.extend({
      template: _.partial(nunjucks.render, 'biblio/edition.html'),
      tagName: 'section',
      className: 'edition',

      templateHelpers: function () {
         var title = this.model.getCanonicalTitle();
         return {
            title: title ? title.getFullTitle() : 'Unknown Title',
            copyRef: this.copyRef
         };
      },

      events: {
         'click .edition-copy.readonline': function () {
            var copyId = this.copyRef.get('copyId');
            this.routerChannel.command('bookreader:show', copyId, { trigger: true });
         }
      },

      regions: {
         authors: '> .partition > .partition-body > .citation > .authors',
         pubInfo: '> .partition > .partition-body > .citation > .pubinfo'
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel', 'copyRefs']);

         this.copyRef = this.copyRefs.findWhere({
            associatedEntry: this.model.getUri()
         });
      },

      onShow: function () {
         var authorsView = new AuthorsView({
            collection: this.model.get('authors'),
            routerChannel: this.routerChannel
         });

         this.getRegion('authors').show(authorsView);


         var pubInfoView = new PublicationInfoView({
            model: this.model.get('publicationInfo')
         });

         this.getRegion('pubInfo').show(pubInfoView);


         if (this.model.has('volumes') &&  !this.model.get('volumes').isEmpty()) {
            var volumesView = new VolumesView({
               collection: this.model.get('volumes'),
               copyRefs: this.copyRefs,
               routerChannel: this.routerChannel
            });

            this.addRegion('volumes', '> .partition > .partition-body > .volumes > div');
            this.getRegion('volumes').show(volumesView);
         }
      }
   });

   var EditionsView = Marionette.CollectionView.extend({
      childView: EditionView,

      childViewOptions: function () {
         return {
            routerChannel: this.routerChannel,
            copyRefs: this.copyRefs
         };
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel', 'copyRefs']);
      }
   });

   var RelationshipView = Marionette.LayoutView.extend({
      template: _.partial(nunjucks.render, 'biblio/reln.html'),
      tagName: 'li',
      className: 'relationship',

      regions: {
         authors: '> .authors'
      },

      templateHelpers: function () {
         var title = this.model.get('target').getCanonicalTitle();
         return {
            title: title ? title.getFullTitle() : 'Unknown Title'
         };
      },

      events: {
         'click .titleinfo': function (e) {
            e.preventDefault();
            var entry = this.model.get('target');
            if (entry) {
               var entryUri = entry.getUri();
               this.routerChannel.command('work:show', entryUri, { trigger: true });
            }
         }
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel']);
      },

      onShow: function () {
         var entry = this.model.get('target');
         if (entry && entry.has('authors')) {
            var authorsView = new AuthorsView({
               collection: entry.get('authors'),
               routerChannel: this.routerChannel
            });

            this.getRegion('authors').show(authorsView);
         }
      }
   });

   var RelationshipsView = Marionette.CollectionView.extend({
      childView: RelationshipView,
      tagName: 'ul',
      className: 'relationships',

      childViewOptions: function () {
         return {
            routerChannel: this.routerChannel
         };
      },

      initialize: function (options) {
         this.mergeOptions(options, ['routerChannel']);
      }
   });

   var WorkDisplayView = Marionette.LayoutView.extend({
      template: _.partial(nunjucks.render, 'biblio/work.html'),
      tagName: 'article',
      className: 'work book',

      templateHelpers: function () {
         var title = this.model.getCanonicalTitle();
         return {
            title: title ? title.getFullTitle() : 'Unknown Title',
            copyRef: this.copyRef,
            relationships: this.relationships
         };
      },

      events: {
         'click .work-copy.readonline': function () {
            var copyId = this.copyRef.get('copyId');
            this.routerChannel.command('bookreader:show', copyId, { trigger: true });
         }
      },

      regions: {
         authors: '> .citation > .authors'
      },

      initialize: function (options) {
         this.mergeOptions(options, ['copyRefs', 'relationships', 'routerChannel']);

         this.copyRef = this.copyRefs.findWhere({
            associatedEntry: this.model.getUri()
         });
      },

      onShow: function () {
         var authorsView = new AuthorsView({
            collection: this.model.get('authors'),
            routerChannel: this.routerChannel
         });

         this.getRegion('authors').show(authorsView);


         if (this.model.has('editions') && !this.model.get('editions').isEmpty()) {
            var editionsView = new EditionsView({
               collection: this.model.get('editions'),
               copyRefs: this.copyRefs,
               routerChannel: this.routerChannel
            });

            this.addRegion('editions', '> .editions > div');
            this.getRegion('editions').show(editionsView);
         }


         if (!this.relationships.isEmpty()) {
            var relationshipsView = new RelationshipsView({
               collection: this.relationships,
               routerChannel: this.routerChannel
            });

            this.addRegion('relationships', '> .relationships > div');
            this.getRegion('relationships').show(relationshipsView);
         }
      }
   });

   return {
      WorkDisplayView: WorkDisplayView
   };

});