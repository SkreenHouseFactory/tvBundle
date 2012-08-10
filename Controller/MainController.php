<?php

/*
 * This file is part of the SkreenHouseFactorytvBundle package.
 *
 * (c) Brickstorm <http://brickstorm.org/>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace SkreenHouseFactory\tvBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use SkreenHouseFactory\tvBundle\Api\ApiManager;

class MainController extends Controller
{
    /**
    *
    */
    public function tvAction(Request $request)
    {

      $response = $this->render('SkreenHouseFactoryTvBundle:Main:tv.html.twig', array(
      ));
      /*$response->headers->set('Access-Control-Allow-Origin', '*');
      $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      $response->headers->set('Access-Control-Allow-Headers', 'X-Requested-With');

      $response->setPublic();
      $response->setMaxAge(3600);
      $response->headers->addCacheControlDirective('must-revalidate', true);
      */

      return $response;
    }
}