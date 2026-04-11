[OK] Send SIGUSR1 to 1566639
docRoot                   /home/qrbir.com/public_html/01.qrbir.com
vhDomain                  01.qrbir.com
vhAliases                 www.01.qrbir.com
adminEmails               admin@qrbir.com
enableGzip                1
enableIpGeo               1

errorlog /home/qrbir.com/logs/qrbir.com.error_log {
  useServer               0
  logLevel                WARN
  rollingSize             10M
}

accesslog /home/qrbir.com/logs/qrbir.com.access_log {
  useServer               0
  logFormat               %h %l %u %t "%r" % %b "%{Referer}i" "%{User-Agent}i"
  logHeaders              5
  rollingSize             10M
  keepDays                10
  compressArchive         1
}

extprocessor kebapci_menu_proxy {
  type                    proxy
  address                 http://127.0.0.1:3010
  maxConns                100
  pcKeepAliveTimeout      60
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}

context / {
  type                    proxy
  handler                 kebapci_menu_proxy
  addDefaultCharset       off
}

rewrite  {
  enable                  1
  autoLoadHtaccess        1
}

context /.well-known/acme-challenge {
  location                /usr/local/lsws/Example/html/.well-known/acme-challenge
  allowBrowse             1
  rewrite  {
    enable                0
  }
  addDefaultCharset       off
}

module cache {
  storagePath /usr/local/lsws/cachedata/01.qrbir.com
}

vhssl  {
  keyFile                 /etc/letsencrypt/live/01.qrbir.com/privkey.pem
  certFile                /etc/letsencrypt/live/01.qrbir.com/fullchain.pem
  certChain               1
  sslProtocol             24
  enableECDHE             1
  renegProtection         1
  sslSessionCache         1
  enableSpdy              15
  enableStapling          1
  ocspRespMaxAge          86400
}
