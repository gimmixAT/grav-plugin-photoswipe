<?php
namespace Grav\Plugin;

use \Grav\Common\Plugin;
use \Grav\Common\Grav;
use \Grav\Common\Page\Page;
use \RocketTheme\Toolbox\Event\Event;

class PhotoswipePlugin extends Plugin
{
	protected $active = false;

	/**
	 * @return array
	 */
	public static function getSubscribedEvents()
	{
		return [
			'onPluginsInitialized' => ['onPluginsInitialized', 0]
		];
	}

	/**
	 * Initialize configuration
	 */
	public function onPluginsInitialized()
	{
		if ($this->isAdmin()) {
			$this->active = false;
			return;
		}

		$this->enable([
			'onPageInitialized' => ['onPageInitialized', 0]
		]);

		if ($this->config->get('system.pages.markdown.extra')) {
			$this->enable([
				'onMarkdownInitialized' => ['onMarkdownInitialized', 0],
			]);
		}
	}

	/**
	 * Initialize configuration
	 */
	public function onPageInitialized()
	{
		$defaults = (array) $this->config->get('plugins.photoswipe');

		/** @var Page $page */
		$page = $this->grav['page'];
		if (isset($page->header()->photoswipe)) {
			$this->config->set('plugins.photoswipe', array_merge($defaults, $page->header()->photoswipe));
		}

		$this->active = $this->config->get('plugins.photoswipe.active');

		if ($this->active) {
			$this->enable([
				'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
			]);
		}
	}

	/**
	 * if enabled on this page, load the JS + CSS theme.
	 */
	public function onTwigSiteVariables()
	{
		$config = $this->config->get('plugins.photoswipe');

		$this->grav['assets']
		     ->addCss('plugin://photoswipe/external/dist/photoswipe.css')
		     ->addCss('plugin://photoswipe/external/dist/default-skin/default-skin.css')
		     ->add('jquery', 101)
		     ->addJs('plugin://photoswipe/external/dist/photoswipe.min.js')
		     ->addJs('plugin://photoswipe/external/dist/photoswipe-ui-default.min.js')
		     ->addJs('plugin://photoswipe/js/activate.js');
	}
	
	/**
	 * add markdown to register lists of images as gallery
	 */
	public function onMarkdownInitialized(Event $event)
	{
		$markdown = $event['markdown'];
		$page = $event['page'];
		
		$markdown->addBlockType('*', 'ListExtended', true, false, 1);
		
		$listExtended = function($Line) use (&$page) {
			$Block = parent::blockList($Line);
			if($Block == null) return $Block;
			$Block['element']['id'] = uniqid('pswp_', true);
			return PhotoswipePlugin::handleListBlock($Block, $page);
		};

		$listExtendedContinue = function($Line, array $Block) use (&$page)  {
			$Block = parent::blockListContinue($Line, $Block);
			if($Block == null) return $Block;
			return PhotoswipePlugin::handleListBlock($Block, $page);
		};

		$markdown->blockListExtended = $listExtended->bindTo($markdown, $markdown);
		$markdown->blockListExtendedContinue = $listExtendedContinue->bindTo($markdown, $markdown);
	}
	
	public static function handleListBlock($Block, $Page) {
		if(!isset($Block['li']) || !isset($Page)) return $Block;
		if (preg_match('/^[ ]*(!.*)$/', $Block['li']['text'][0], $matches, PREG_OFFSET_CAPTURE))
		{
			$Block['element']['attributes']['class'] = 'pswp-gallery';
			$Block['li']['attributes']['data-gallery'] = $Block['element']['id'];
			if(preg_match('/\[([^\]]*)\]\(([^\)?]+).*?\)/', $Block['li']['text'][0], $titleMatch)){
				if(!empty($titleMatch[1])) {
					$Block['li']['attributes']['title'] = $titleMatch[1];
				}
				$image = $Page->media()->images()[urldecode($titleMatch[2])];
				if (!empty($image)) {
					$Block['li']['attributes']['data-size'] = $image->width.'x'.$image->height;
				}
			}
		}
		return $Block;
	}
}
