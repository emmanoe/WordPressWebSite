#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset


LEGO_BIN=/home/emmanoe/App/wordpress-5.6-0/letsencrypt/lego
CERTIFICATES_DIR=/home/emmanoe/App/wordpress-5.6-0/letsencrypt/certificates

stderr_print() {
    printf '%b\n' "${*}" >&2
}

am_i_root() {
    if [ "$(id | sed -e s/uid=//g -e s/\(.*//g)" -ne 0 ];  then
        false
    else
        true
    fi
}

is_apache_installed() {
    if [ -d "/home/emmanoe/App/wordpress-5.6-0/apache2" ]; then
        true
    else
        false
    fi
}

server_type() {
    if is_apache_installed; then
        echo apache
    else
        echo nginx
    fi
}
stop_server() {
    /home/emmanoe/App/wordpress-5.6-0/ctlscript.sh stop "$(server_type)"
}

start_server() {
    /home/emmanoe/App/wordpress-5.6-0/ctlscript.sh start "$(server_type)"
}

restart_server() {
    /home/emmanoe/App/wordpress-5.6-0/ctlscript.sh restart "$(server_type)"
}

is_varnish_enabled() {
    if [[ -f "/home/emmanoe/App/wordpress-5.6-0/varnish/scripts/ctl.sh" ]]; then
        true
    else
        false
    fi
}

is_varnish_running() {
    if is_varnish_enabled && "/home/emmanoe/App/wordpress-5.6-0/ctlscript.sh" status varnish 2> /dev/null | grep "already running" > /dev/null 2>&1 ; then
        true
    else
        false
    fi
}
stop_varnish() {
    "/home/emmanoe/App/wordpress-5.6-0/ctlscript.sh" stop "varnish"
}

start_varnish() {
    "/home/emmanoe/App/wordpress-5.6-0/ctlscript.sh" start "varnish"
}

should_start_varnish=0
start_varnish_if_needed() {
    if [[ "$should_start_varnish" == 1 ]]; then
        start_varnish
        should_start_varnish=0
    fi
}
stop_varnish_if_needed() {
    if is_varnish_running; then
        should_start_varnish=1
        stop_varnish
    fi
}

web_server_conf_dir() {
    if is_apache_installed; then
        echo "/home/emmanoe/App/wordpress-5.6-0/apache2/conf"
    else
        echo "/home/emmanoe/App/wordpress-5.6-0/nginx/conf"
    fi
}

ask() {
    local msg="${1:?msg not set}"
    local default_answer="${2:-}"
    local suffix="[y/n]"
    if [ -n "$default_answer" ]; then
        case "$default_answer" in
            [Yy]*)
                suffix="[Y/n]"
                ;;
            [Nn]*)
                suffix="[y/N]"
                ;;
            *)
                stderr_print "invalid default $default_answer"
                return 1
        esac
    fi
    echo -n "${msg} $suffix: "
    while true; do
        read -r -p "" yn
        case "$yn" in
            [Yy]* )
                true
                return
                ;;
            [Nn]* )
                false
                return 1
                ;;
            * )
                if [[ -z "$yn" &&  -n "$default_answer" ]]; then
                    if [ "$default_answer" = "yes" ]; then
                        true
                    else
                        false
                    fi
                    return
                else
                    echo
                    echo -n  "Please answer yes [y] or no [n]. ${msg} $suffix: "
                fi
                ;;
        esac
    done

}

usage() {
    cat <<EOF
Bitnami script to generate the SSL certificates and configure the web server.

Usage: $0
  -m your_email     Email used for registration and recovery contact.
  -d your_domain    Add a domain to the process. Can be specified multiple times.
  -h                Show help

EOF
    exit 0
}

documentation_support_message() {
    documentation_url="https://docs.bitnami.com/"
    support_url="https://community.bitnami.com/"
    stderr_print 'Please check our documentation or open a ticket in our community forum,' \
                 'our team will be more than happy to help you!\n\n' \
                 "Documentation: $documentation_url\\n" \
                 "Support: $support_url\\n"
}

backup_file() {
    local file="${1:?file not provided}"
    local backup="${file}.back"
    cp -rp "$file" "$backup"
}

backup_configuration() {
    backup_file "$(web_server_conf_dir)/bitnami/bitnami.conf"
}

modify_configuration() {
    if is_apache_installed; then
        sed -i "s;\s*SSLCertificateFile\s.*;  SSLCertificateFile \"/home/emmanoe/App/wordpress-5.6-0/apache2/conf/${domains[0]}.crt\";g" "$(web_server_conf_dir)/bitnami/bitnami.conf"
        sed -i "s;\s*SSLCertificateKeyFile\s.*;  SSLCertificateKeyFile \"/home/emmanoe/App/wordpress-5.6-0/apache2/conf/${domains[0]}.key\";g" "$(web_server_conf_dir)/bitnami/bitnami.conf"
    else
        sed -i "s;\s*ssl_certificate\s.*;\tssl_certificate\t${domains[0]}.crt\;;g" "$(web_server_conf_dir)/bitnami/bitnami.conf"
        sed -i "s;\s*ssl_certificate_key\s.*;\tssl_certificate_key\t${domains[0]}.key\;;g" "$(web_server_conf_dir)/bitnami/bitnami.conf"
    fi
}

restore_configuration() {
    echo
    echo "We are going to try to recover the web server configuration now..."
    echo
    if [ -e "$(web_server_conf_dir)/bitnami/bitnami.conf.back" ]; then
        cp -rp "$(web_server_conf_dir)/bitnami/bitnami.conf"{.back,}
    fi

    restart_server
    start_varnish_if_needed
}

create_certificate_symlink() {
    local crt_file="$CERTIFICATES_DIR/${domains[0]}.crt"
    local key_file="$CERTIFICATES_DIR/${domains[0]}.key"

    for f in "$crt_file" "$key_file"; do
        ln -sf "$f" "$(web_server_conf_dir)"
    done
}

configure_crontab() {
    local USER=""
    local SUDO=""
    ##Check if the bitnami user exists. If the user exists,
    ##this command will return an exit code equal to 0
    if id -u bitnami > /dev/null 2>&1 ; then
        USER="-u bitnami"
        SUDO="sudo"
    fi

    if crontab $USER -l 2> /dev/null | grep "$LEGO_BIN" > /dev/null 2>&1 ; then
        cat <<"EOF"
It seems that there is already at least one job to renew the certificates in cron. This can affect the security of the application.
As you are configuring new certificates, we suggest you removing it automatically now.
EOF
        if ask "Do you want to do it?"; then
            crontab $USER -l | grep -v "$LEGO_BIN" | crontab $USER - || true
        else
            documentation_support_message
        fi
    fi
    local server_restart_command=""
    if is_apache_installed; then
        server_restart_command="/home/emmanoe/App/wordpress-5.6-0/apache2/bin/httpd -f /home/emmanoe/App/wordpress-5.6-0/apache2/conf/httpd.conf -k graceful"
    else
        server_restart_command="/home/emmanoe/App/wordpress-5.6-0/nginx/sbin/nginx -s reload"
    fi

    crontab $USER -l 2> /dev/null | {
        cat
        echo "0 0 1 * * $SUDO $LEGO_BIN --path=\"/home/emmanoe/App/wordpress-5.6-0/letsencrypt\" --tls --email=\"${email}\" ${domain_args} renew && $SUDO $server_restart_command"
    } | crontab $USER - 2> /dev/null
}

email=""
declare -a domains=()

previous_command=""
this_command=""

setup() {

    cleanup() {
        stderr_print '\nError: Something went wrong when running the following command:\n\n' \
                     "\$ ${previous_command}\\n"
        documentation_support_message
        restore_configuration
        exit 1
    }

    enable_exit_trap() {
        set -e
        trap 'cleanup' EXIT
    }

    disable_exit_trap() {
        set +e
        trap - EXIT
    }

    trap 'previous_command=$this_command; this_command=$BASH_COMMAND' DEBUG

    setup_web_server() {
        enable_exit_trap
        create_certificate_symlink
        # Modify the web server configuration and start it again
        modify_configuration
        start_server
        disable_exit_trap
    }

    for val in ${domains[*]}; do
        domain_args+=" --domains=$val"
    done

    if [ "$(server_type)" = "apache" ]; then
        printf '\nThere is a new tool available for configuring HTTPS certificates, which is easier to use and includes new features such as redirections. Find it in the following path:\n\n    /home/emmanoe/App/wordpress-5.6-0/bncert-tool\n'
        printf '\nYou can read more about it here:\n\n    https://docs.bitnami.com/general/how-to/understand-bncert/\n\n'
        if ! ask "Do you want to continue anyways?" n; then
            exit
        fi
    fi

    printf '\nThis tool will now stop the web server and configure the required SSL certificate. It will also start it again once finished.\n\n'

    if [[ "${#domains[*]}" -gt 1 ]]; then
        cat <<EOF
When supplying multiple domains, Lego creates a SAN (Subject Alternate Names) certificate which results in only one certificate
under the email "${email}" valid for all domains you entered ("${domains[*]}").

The first domain in your list ("${domains[0]}") will be added as the "CommonName" of the certificate and the rest will be added
as "DNSNames" to the SAN extension  within the certificate
EOF
    elif [[ "${#domains[*]}" -eq 1 ]]; then
        echo "It will create a certificate for the domain \"${domains[0]}\" under the email \"${email}\""
    fi
    echo
    if ! ask "Do you want to continue?"; then
        exit 2
    fi

    for f in "$(web_server_conf_dir)/${domains[0]}.crt" "$(web_server_conf_dir)/${domains[0]}.key"; do
        if [ -e "$f" ]; then
            stderr_print '\nIt seems there is a valid certificate in the web server configuration folder. Please renew that certificate or generate new ones manually'
            documentation_support_message
            exit 4
        fi
    done

    enable_exit_trap
    backup_configuration
    stop_server

    stop_varnish_if_needed

    # Generate certificate with the provided information
    "$LEGO_BIN" --path "/home/emmanoe/App/wordpress-5.6-0/letsencrypt" --tls --email="${email}" ${domain_args} run

    

    disable_exit_trap

    # Modify the permissions of the generated certificate
    if [ ! -e "$CERTIFICATES_DIR/${domains[0]}.crt" ]; then
        stderr_print "Error: Something went wrong when creating the certificates and there is not any valid one in the \"$CERTIFICATES_DIR\" folder"
        documentation_support_message
        restore_configuration
        exit 3
    fi

    enable_exit_trap
    chmod a+rx "$CERTIFICATES_DIR"
    chmod a+r "$CERTIFICATES_DIR/${domains[0]}"{.crt,.key}
    disable_exit_trap

    setup_web_server

    start_varnish_if_needed
    cat <<"EOF"

Congratulations, the generation and configuration of your SSL certificate finished properly.

You can now configure a cronjob to renew it every month.

EOF

    # Configure the cronjob to renew the certificate every month
    if ask "Do you want to proceed?"; then
        configure_crontab
    fi
}

while getopts "hm::d::" o; do
    case "${o}" in
        m)
            email=${OPTARG} ;;
        d)
            domains+=("$OPTARG") ;;
        *)
            usage ;;
    esac
done

if [ -z "${email}" ] || [ "${#domains[*]}" -le 0 ] ; then
    usage
else
    if ! am_i_root; then
        stderr_print "Error: This script requires root privileges to run, please run it using admin privileges."
        exit 5
    fi
    setup
fi

