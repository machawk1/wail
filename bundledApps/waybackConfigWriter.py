# The purpose of this script is to write the Wayback configuration files dynamically based on
# the location of the script. This is necessary, as absolute paths are required for WARC ingestion

import os, pystache

##########################################
# wayback.xml
##########################################

xml = """<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans-2.5.xsd"
       default-init-method="init">

<!--
    Macro-like substitutions for the overall file:
      wayback.basedir: default top level directory for all index, state, 
		                 locationdb storage.
-->

  <bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="properties">
      <value>
        wayback.basedir={{waybackBaseDir}}
        wayback.urlprefix={{waybackURLPrefix}}
      </value>
    </property>
  </bean>

  <bean id="waybackCanonicalizer" class="org.archive.wayback.util.url.AggressiveUrlCanonicalizer" />


<!--
	The ResourceFileLocationDB implementation to use for mapping ARC/WARC names
	to absolute paths/URLs via a BDBJE database.
-->
  <bean id="resourcefilelocationdb" class="org.archive.wayback.resourcestore.locationdb.BDBResourceFileLocationDB">
    <property name="bdbPath" value="${wayback.basedir}/file-db/db/" />
    <property name="bdbName" value="DB1" />
    <property name="logPath" value="${wayback.basedir}/file-db/db.log" />
  </bean>
<!--
	The following bean provides an alternate flat-file based LocationDB
	implementation.
-->
<!--
  <bean id="resourcefilelocationdb" class="org.archive.wayback.resourcestore.locationdb.FlatFileResourceFileLocationDB">
    <property name="path" value="${wayback.basedir}/path-index.txt" />
  </bean>
-->
<!--
    To enable manual management of, or remote access to the above locationDB,
    uncomment the following bean.
-->
<!--
  <bean name="8080:locationdb" class="org.archive.wayback.resourcestore.locationdb.ResourceFileLocationDBServlet">
    <property name="locationDB" ref="resourcefilelocationdb" />
  </bean>
-->

<!--
	The FileProxyServlet uses a ResourceFileLocationDB to make all ARC/WARC 
	files appear to reside within a single HTTP 1.1 exported directory.
	Required when using the SimpleResourceStore to access distributed ARC/WARC
	files over HTTP through a single reverse proxy.
-->
<!--
  <bean name="8080:fileproxy" class="org.archive.wayback.resourcestore.locationdb.FileProxyServlet">
    <property name="locationDB" ref="resourcefilelocationdb" />
  </bean>
-->

<!--
	The XML files indicated in the following import tags contain alternate 
	example implementations of WaybackCollections. To specify where your 
	ARC/WARC files are located, see the file BDBCollection.xml.
-->

  <import resource="BDBCollection.xml"/>
<!--
  <import resource="CDXCollection.xml"/>
  <import resource="RemoteCollection.xml"/>
  <import resource="NutchCollection.xml"/>
-->




<!--
  LiveWeb.xml contains the 'proxylivewebcache' bean that enable fetching 
  content from the live web, recording that content in ARC files.
  To use the "excluder-factory-robot" bean as an exclusionFactory property of 
  AccessPoints, which will cause live robots.txt files to be consulted 
  retroactively before showing archived content, you'll need to import 
  LiveWeb.xml as well. 
-->
<!--
  <import resource="LiveWeb.xml"/>
  <bean id="excluder-factory-robot" class="org.archive.wayback.accesscontrol.robotstxt.RobotExclusionFilterFactory">
    <property name="maxCacheMS" value="86400000" />
    <property name="userAgent" value="ia_archiver" />
    <property name="webCache" ref="proxylivewebcache" />
  </bean>
-->

<!--
  The 'excluder-factory-static' bean defines an exclusionFactory object which
  consults a local text file containing either URLs or SURTs of content to 
  block from the ResourceIndex. These URLs or SURTs are treated as prefixes:
     "http://www.archive.org/ima" will block anything starting with that string
     from being returned from the index.
-->
<!--
  <bean id="excluder-factory-static" class="org.archive.wayback.accesscontrol.staticmap.StaticMapExclusionFilterFactory">
    <property name="file" value="/var/tmp/os-cdx/exclusion-2008-09-22-cleaned.txt" />
    <property name="checkInterval" value="600000" />
  </bean>
-->

<!--
  The 'excluder-factory-composite' bean creates a single exclusionFactory 
  which restricts from both a static list of URLs, and also by live web 
  robots.txt documents. 
-->
<!--
  <bean id="excluder-factory-composite" class="org.archive.wayback.accesscontrol.CompositeExclusionFilterFactory">
    <property name="factories">
      <list>
        <ref bean="excluder-factory-static" />
        <ref bean="excluder-factory-robot" />
      </list>
    </property>
  </bean>
-->

<!--
    This is the only AccessPoint defined by default within this wayback.xml
    Spring configuration file, providing an ArchivalURL Replay UI to the
    "localbdbcollection", defined in "BDBCollection.xml" by providing
    ArchivalURL-specific implementations of the replay, parser, and
    uriConverter.

    This AccessPoint currently will provide access only from the machine
    running Tomcat. To provide external access, replace "localhost.archive.org"
    with your fully qualified hostname of the computer running Tomcat.
-->
  <import resource="ArchivalUrlReplay.xml"/>
  
  <!--
    Last ditch attempt to resolve server-relative URLs (/page1.htm) that were 
    not successfully rewritten, resolving them against the referring URL to
    get them back on track.
  -->
  <bean name="+" class="org.archive.wayback.webapp.ServerRelativeArchivalRedirect">
    <property name="matchPort" value="8080" />
    <property name="useCollection" value="true" />
  </bean>

  <bean name="8080:wayback" class="org.archive.wayback.webapp.AccessPoint">
    <property name="serveStatic" value="true" />
    <property name="bounceToReplayPrefix" value="false" />
    <property name="bounceToQueryPrefix" value="false" />

	<!--
	  These properties enable customized handling of query, replay, and static
	  requests by different URL prefixes
	-->
	
    <property name="replayPrefix" value="${wayback.urlprefix}" />
    <property name="queryPrefix" value="${wayback.urlprefix}" />
    <property name="staticPrefix" value="${wayback.urlprefix}" />

	<!--
		The following property will cause only results matching the exact host
		the user requested to be displayed. URLs matching other versions of the
		same host will be stored in the closeMatches list of the SearchResults,
		and can be displayed by query .jsp files.
	-->
	<!--
    <property name="exactHostMatch" value="true" />
	-->
    
    <property name="collection" ref="localbdbcollection" />
<!--
    <property name="collection" ref="localcdxcollection" />
-->

    <property name="replay" ref="archivalurlreplay" />
    <property name="query">
      <bean class="org.archive.wayback.query.Renderer">
        <property name="captureJsp" value="/WEB-INF/query/CalendarResults.jsp" />
<!--
        This .jsp provides a "search engine" style listing of results vertically
        <property name="captureJsp" value="/WEB-INF/query/HTMLCaptureResults.jsp" />
-->
      </bean>
    </property>

    <property name="uriConverter">
      <bean class="org.archive.wayback.archivalurl.ArchivalUrlResultURIConverter">
        <property name="replayURIPrefix" value="${wayback.urlprefix}"/>
      </bean>
    </property>

    <property name="parser">
      <bean class="org.archive.wayback.archivalurl.ArchivalUrlRequestParser">
        <property name="maxRecords" value="10000" />
        <!--
        <property name="earliestTimestamp" value="1999" />
        <property name="latestTimestamp" value="2004" />
        -->
      </bean>
    </property>

<!-- See the LiveWeb.xml import above.
    <property name="exclusionFactory" ref="excluder-factory-static" />
-->

  </bean>


<!--
			===========================================================
			All beans defined below here represent examples of alternate
			AccessPoint definitions and implementations.
			===========================================================
-->


<!--
  The following import and two bean definitions enable Memento access to
  content in your collections.
-->

  <import resource="MementoReplay.xml"/>
  <bean name="8080:memento" parent="8080:wayback">
    <property name="replayPrefix" value="{{waybackURLPrefix}}memento/" />
    <property name="queryPrefix" value="{{waybackURLPrefix}}list/" />
	<property name="configs">
      <props>
	    <prop key="aggregationPrefix">{{waybackURLPrefix}}list/</prop>
      </props>
	</property>

    <property name="replay" ref="mementoreplay" />
    <property name="query">
      <bean class="org.archive.wayback.query.Renderer">
        <property name="captureJsp" value="/WEB-INF/query/Memento.jsp" />
      </bean>
    </property>

    <property name="uriConverter">
      <bean class="org.archive.wayback.archivalurl.ArchivalUrlResultURIConverter">
        <property name="replayURIPrefix" value="{{waybackURLPrefix}}memento/"/>
      </bean>
    </property>
    <property name="parser">
      <bean class="org.archive.wayback.memento.MementoRequestParser">
        <property name="maxRecords" value="10000" />
        <property name="earliestTimestamp" value="1996" />
      </bean>
    </property>
    <property name="exception">
      <bean class="org.archive.wayback.exception.BaseExceptionRenderer">
        <property name="errorJsp" value="/WEB-INF/exception/TimegateError.jsp" />
      </bean>
    </property>
  </bean>


  <bean name="8080:list" parent="8080:memento">
    <property name="replayPrefix" value="{{waybackURLPrefix}}memento/" />
    <property name="queryPrefix" value="{{waybackURLPrefix}}list/" />
    <property name="staticPrefix" value="{{waybackURLPrefix}}list/" />
	<property name="configs">
	  <props>
	    <prop key="Prefix">{{waybackURLPrefix}}memento/</prop>
	  </props>
	</property>

    <property name="replay" ref="archivalurlreplay" />
    <property name="query">
      <bean class="org.archive.wayback.query.Renderer">
        <property name="captureJsp" value="/WEB-INF/query/ORE.jsp" />
      </bean>
    </property>

    <property name="uriConverter">
      <bean class="org.archive.wayback.archivalurl.ArchivalUrlResultURIConverter">
        <property name="replayURIPrefix" value="http://localhost:8080/list/"/>
      </bean>
    </property>
  </bean>


<!--
    The following AccessPoint inherits all configuration from the 8080:wayback
    AccessPoint, but provides a OpenSearch format query results.
         
    Note: the links generated by this AccessPoint drive to the parent 
         8080:wayback AccessPoint: presumably users following links from here
         will prefer the HTML interface. 
 -->
 <!--
  <bean name="8080:opensearch" parent="8080:wayback">
    <property name="queryPrefix" value="http://localhost.archive.org:8080/opensearch/" />
    <property name="query">
      <bean class="org.archive.wayback.query.Renderer">
        <property name="captureJsp" value="/WEB-INF/query/OpenSearchCaptureResults.jsp" />
        <property name="urlJsp" value="/WEB-INF/query/OpenSearchUrlResults.jsp" />
      </bean>
    </property>
    <property name="exception">
      <bean class="org.archive.wayback.exception.BaseExceptionRenderer">
        <property name="xmlErrorJsp" value="/WEB-INF/exception/OpenSearchError.jsp" />
        <property name="errorJsp" value="/WEB-INF/exception/OpenSearchError.jsp" />
      </bean>
    </property>
  </bean>
  -->

<!--
    The following AccessPoint inherits all configuration from the 8080:wayback
    AccessPoint, but provides a DomainPrefix Replay UI to the same collection.
    These two access points can be used simultaneously on the same Tomcat 
    installation.
  
    Note: using this AccessPoint requires adding a "Connector" on port 8081
         in your Tomcat's server.xml file.
         
    Note: the hostname suffix localhost.archive.org has a special DNS wildcard
         entry, so all hostnames suffixed with this value resolve to 127.0.0.1 
 -->
<!--
  <import resource="DomainPrefixReplay.xml"/>
  <bean name="8081" parent="8080:wayback">
    <property name="queryPrefix" value="http://localhost.archive.org:8081/" />
    <property name="replayPrefix" value="http://localhost.archive.org:8081/" />
    <property name="staticPrefix" value="http://localhost.archive.org:8081/" />
    <property name="replay" ref="domainprefixreplay" />
    <property name="uriConverter">
      <bean class="org.archive.wayback.domainprefix.DomainPrefixResultURIConverter">
        <property name="hostPort" value="localhost.archive.org:8081" />
      </bean>
    </property>
    <property name="parser">
      <bean class="org.archive.wayback.domainprefix.DomainPrefixCompositeRequestParser">
        <property name="hostPort" value="localhost.archive.org:8081" />
        <property name="maxRecords" value="1000" />
      </bean>
    </property>
  </bean>
-->
<!--
    The following AccessPoint inherits all configuration from the 8080:wayback
    AccessPoint, but provides a Proxy Replay UI to the same collection. These
    two access points can be used simultaneously on the same Tomcat 
    installation.
  
    Note: using this AccessPoint requires adding a "Connector" on port 8090
         in your Tomcat's server.xml file.
 -->
<!--
  <import resource="ProxyReplay.xml"/>
  <bean name="8090" parent="8080:wayback">
    <property name="serveStatic" value="true" />
    <property name="bounceToReplayPrefix" value="false" />
    <property name="bounceToQueryPrefix" value="false" />
    <property name="refererAuth" value="" />

    <property name="staticPrefix" value="http://localhost.archive.org:8090/" />
    <property name="replayPrefix" value="http://localhost.archive.org:8090/" />
    <property name="queryPrefix" value="http://localhost.archive.org:8090/" />
    <property name="replay" ref="proxyreplay" />
    <property name="uriConverter">
      <bean class="org.archive.wayback.proxy.RedirectResultURIConverter">
        <property name="redirectURI" value="http://localhost.archive.org:8090/jsp/QueryUI/Redirect.jsp" />
      </bean>
    </property>
    <property name="parser">
      <bean class="org.archive.wayback.proxy.ProxyRequestParser">
        <property name="localhostNames">
          <list>
            <value>localhost.archive.org</value>
          </list>
        </property>
        <property name="maxRecords" value="1000" />
        <property name="addDefaults" value="false" />
      </bean>
    </property>
  </bean>
-->

</beans>"""



def write_config(self):
 thisScriptsPath = os.path.dirname(os.path.realpath(__file__))
 waybackRoot = thisScriptsPath+"/tomcat/webapps/ROOT"
 filename = 'waybackNEW.xml'

 # Delete the config file if it exists
 try:
    os.remove(filename)
 except OSError:
    pass

 waybackXML =  pystache.render(xml,{"waybackBaseDir":waybackRoot,"waybackURLPrefix":"http://localhost:8080/wayback/"})
 with open(filename, 'a') as xmlfile:
    xmlfile.write(waybackXML)
   