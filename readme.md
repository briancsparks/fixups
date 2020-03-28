# Fixups

TODO:

Before stopping Jenkins and the build slave, ...
* Inform Jenkins that we are shutting him down, so he can gracefully stop things.
  * `java -jar jenkins-cli.jar -s http://<jenkins-server>/ safe-shutdown`
  * `curl -X POST -u <user>:<password> http://<jenkins.server>/safeExit`
    * (before docker-compose down).
  * See: https://support.cloudbees.com/hc/en-us/articles/216118748-How-to-Start-Stop-or-Restart-your-Instance-
* Or, just `cd jenkins-data && docker-compose down`


